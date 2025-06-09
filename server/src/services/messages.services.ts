import { ObjectId } from 'mongodb'
import { SendMessageReqBody } from '~/models/request/Message.requests'
import Message, { MessageStatus, MessageTypes } from '~/models/schemas/message.chema'
import databaseService from './database.services'
import { ErrorWithStatus } from '~/models/Errors'
import { MESSAGES_MESSAGES, CONVERSATIONS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'

class MessagesServices {
  async sendMessage(sender_id: string, body: SendMessageReqBody) {
    const { conversation_id, content, message_type, medias, reply_to } = body

    // Verify conversation exists and user is participant
    const conversation = await databaseService.conversations.findOne({
      _id: new ObjectId(conversation_id)
    })

    if (!conversation) {
      throw new ErrorWithStatus({
        messages: CONVERSATIONS_MESSAGES.NO_CONVERSATION,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Check if user is participant in conversation
    const isParticipant =
      conversation.sender_id.toString() === sender_id ||
      conversation.receiver_id.some((id) => id.toString() === sender_id)

    if (!isParticipant) {
      throw new ErrorWithStatus({
        messages: MESSAGES_MESSAGES.NOT_CONVERSATION_PARTICIPANT,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    const _id = new ObjectId()
    new Message({
      _id,
      conversation_id: new ObjectId(conversation_id as string),
      sender_id: new ObjectId(sender_id),
      content,
      message_type: message_type || MessageTypes.Text,
      medias: medias || [],
      reply_to: reply_to ? new ObjectId(reply_to as string) : undefined,
      status: MessageStatus.Sent
    })

    await databaseService.conversations.updateOne(
      { _id: new ObjectId(conversation_id) },
      {
        $set: {
          content: content,
          update_at: new Date()
        }
      }
    )

    const result = await databaseService.messages.findOne({ _id })

    // Get sender info
    const sender = await databaseService.users.findOne(
      { _id: new ObjectId(sender_id) },
      { projection: { username: 1, avatar: 1 } }
    )

    return {
      ...result,
      sender
    }
  }

  async getMessages(user_id: string, conversation_id: string, limit: number, page: number, before_message_id?: string) {
    // Verify user is participant in conversation
    const conversation = await databaseService.conversations.findOne({
      _id: new ObjectId(conversation_id)
    })

    if (!conversation) {
      throw new ErrorWithStatus({
        messages: CONVERSATIONS_MESSAGES.NO_CONVERSATION,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const isParticipant =
      conversation.sender_id.toString() === user_id || conversation.receiver_id.some((id) => id.toString() === user_id)

    if (!isParticipant) {
      throw new ErrorWithStatus({
        messages: MESSAGES_MESSAGES.NOT_CONVERSATION_PARTICIPANT,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    const query: any = { conversation_id: new ObjectId(conversation_id) }

    // If before_message_id is provided, get messages before that message
    if (before_message_id) {
      const beforeMessage = await databaseService.messages.findOne({
        _id: new ObjectId(before_message_id)
      })
      if (beforeMessage) {
        query.created_at = { $lt: beforeMessage.created_at }
      }
    }

    const messages = await databaseService.messages
      .find(query)
      .sort({ created_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    // Get sender info for each message
    const messagesWithSenderInfo = await Promise.all(
      messages.map(async (message) => {
        const sender = await databaseService.users.findOne(
          { _id: message.sender_id },
          { projection: { username: 1, avatar: 1 } }
        )

        // If message is a reply, get the original message
        let replyToMessage = null
        if (message.reply_to) {
          replyToMessage = await databaseService.messages.findOne({
            _id: message.reply_to
          })
          if (replyToMessage) {
            const replyToSender = await databaseService.users.findOne(
              { _id: replyToMessage.sender_id },
              { projection: { username: 1 } }
            )
            replyToMessage = {
              ...replyToMessage,
              sender: replyToSender
            }
          }
        }

        return {
          ...message,
          sender,
          reply_to_message: replyToMessage
        }
      })
    )

    const total = await databaseService.messages.countDocuments({
      conversation_id: new ObjectId(conversation_id)
    })

    const has_more = page * limit < total

    return {
      messages: messagesWithSenderInfo.reverse(), // Reverse to show oldest first
      total,
      has_more
    }
  }

  async editMessage(user_id: string, message_id: string, new_content: string) {
    const message = await databaseService.messages.findOne({
      _id: new ObjectId(message_id)
    })

    if (!message) {
      throw new ErrorWithStatus({
        messages: MESSAGES_MESSAGES.MESSAGE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (message.sender_id.toString() !== user_id) {
      throw new ErrorWithStatus({
        messages: MESSAGES_MESSAGES.NOT_YOUR_MESSAGE,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    const result = await databaseService.messages.findOneAndUpdate(
      { _id: new ObjectId(message_id) },
      {
        $set: {
          content: new_content,
          edited: true,
          edited_at: new Date(),
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    return result
  }

  async deleteMessage(user_id: string, message_id: string) {
    const message = await databaseService.messages.findOne({
      _id: new ObjectId(message_id)
    })

    if (!message) {
      throw new ErrorWithStatus({
        messages: MESSAGES_MESSAGES.MESSAGE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (message.sender_id.toString() !== user_id) {
      throw new ErrorWithStatus({
        messages: MESSAGES_MESSAGES.NOT_YOUR_MESSAGE,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    await databaseService.messages.deleteOne({
      _id: new ObjectId(message_id)
    })
  }

  async markMessagesAsRead(user_id: string, conversation_id: string) {
    // Mark all unread messages in conversation as read
    const result = await databaseService.messages.updateMany(
      {
        conversation_id: new ObjectId(conversation_id),
        sender_id: { $ne: new ObjectId(user_id) }, // Not sent by current user
        status: { $ne: MessageStatus.Read }
      },
      {
        $set: {
          status: MessageStatus.Read,
          updated_at: new Date()
        }
      }
    )

    return { modified_count: result.modifiedCount }
  }

  async searchMessages(user_id: string, conversation_id: string, search_term: string, limit: number, page: number) {
    // Verify user is participant
    const conversation = await databaseService.conversations.findOne({
      _id: new ObjectId(conversation_id)
    })

    if (!conversation) {
      throw new ErrorWithStatus({
        messages: CONVERSATIONS_MESSAGES.NO_CONVERSATION,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const isParticipant =
      conversation.sender_id.toString() === user_id || conversation.receiver_id.some((id) => id.toString() === user_id)

    if (!isParticipant) {
      throw new ErrorWithStatus({
        messages: MESSAGES_MESSAGES.NOT_CONVERSATION_PARTICIPANT,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    const messages = await databaseService.messages
      .find({
        conversation_id: new ObjectId(conversation_id),
        content: { $regex: search_term, $options: 'i' }
      })
      .sort({ created_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    // Get sender info for each message
    const messagesWithSenderInfo = await Promise.all(
      messages.map(async (message) => {
        const sender = await databaseService.users.findOne(
          { _id: message.sender_id },
          { projection: { username: 1, avatar: 1 } }
        )
        return {
          ...message,
          sender
        }
      })
    )

    const total = await databaseService.messages.countDocuments({
      conversation_id: new ObjectId(conversation_id),
      content: { $regex: search_term, $options: 'i' }
    })

    return { messages: messagesWithSenderInfo, total }
  }
}

const messagesServices = new MessagesServices()
export default messagesServices
