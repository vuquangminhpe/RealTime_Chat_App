import { ObjectId } from 'mongodb'
import { SendMessageReqBody } from '~/models/request/Message.requests'
import Message, { MessageStatus, MessageTypes } from '~/models/schemas/message.chema'
import PinnedMessage from '~/models/schemas/pinnedMessage.schema'
import MessageReaction from '~/models/schemas/messageReaction.schema'
import databaseService from './database.services'
import notificationsServices from './notifications.services'
import { ErrorWithStatus } from '~/models/Errors'
import { MESSAGES_MESSAGES, CONVERSATIONS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { ReactionStatus } from '~/constants/enum'

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
    const messageData = new Message({
      _id,
      conversation_id: new ObjectId(conversation_id as string),
      sender_id: new ObjectId(sender_id),
      content,
      message_type: message_type || MessageTypes.Text,
      medias: medias || [],
      reply_to: reply_to ? new ObjectId(reply_to as string) : undefined,
      status: MessageStatus.Sent
    })

    // Insert message into database
    await databaseService.messages.insertOne(messageData)

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

    // Create notifications for other participants (not sender)
    const otherParticipants = conversation.receiver_id.filter(id => id.toString() !== sender_id)
    for (const participant_id of otherParticipants) {
      await notificationsServices.createMessageNotification(
        participant_id.toString(), 
        sender_id, 
        conversation_id, 
        content
      )
    }

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

  // Pin message functionality
  async pinMessage(user_id: string, message_id: string) {
    // Verify message exists and user is participant
    const message = await databaseService.messages.findOne({
      _id: new ObjectId(message_id)
    })

    if (!message) {
      throw new ErrorWithStatus({
        messages: MESSAGES_MESSAGES.MESSAGE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Verify user is participant in conversation
    const conversation = await databaseService.conversations.findOne({
      _id: message.conversation_id
    })

    if (!conversation) {
      throw new ErrorWithStatus({
        messages: CONVERSATIONS_MESSAGES.NO_CONVERSATION,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const isParticipant =
      conversation.sender_id.toString() === user_id ||
      conversation.receiver_id.some((id) => id.toString() === user_id)

    if (!isParticipant) {
      throw new ErrorWithStatus({
        messages: MESSAGES_MESSAGES.NOT_CONVERSATION_PARTICIPANT,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    // Check if message is already pinned
    const existingPin = await databaseService.pinnedMessages.findOne({
      message_id: new ObjectId(message_id)
    })

    if (existingPin) {
      throw new ErrorWithStatus({
        messages: 'Message is already pinned',
        status: HTTP_STATUS.CONFLICT
      })
    }

    // Check if conversation already has 2 pinned messages
    const pinnedCount = await databaseService.pinnedMessages.countDocuments({
      conversation_id: message.conversation_id
    })

    if (pinnedCount >= 2) {
      throw new ErrorWithStatus({
        messages: 'Maximum 2 messages can be pinned. Please unpin one message first.',
        status: HTTP_STATUS.CONFLICT
      })
    }

    // Pin the message
    const pinnedMessage = new PinnedMessage({
      _id: new ObjectId(),
      conversation_id: message.conversation_id,
      message_id: new ObjectId(message_id),
      pinned_by: new ObjectId(user_id)
    })

    await databaseService.pinnedMessages.insertOne(pinnedMessage)

    return { message: 'Message pinned successfully', pinned_message: pinnedMessage }
  }

  async unpinMessage(user_id: string, message_id: string) {
    // Verify message exists and user is participant
    const message = await databaseService.messages.findOne({
      _id: new ObjectId(message_id)
    })

    if (!message) {
      throw new ErrorWithStatus({
        messages: MESSAGES_MESSAGES.MESSAGE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Verify user is participant in conversation
    const conversation = await databaseService.conversations.findOne({
      _id: message.conversation_id
    })

    const isParticipant =
      conversation?.sender_id.toString() === user_id ||
      conversation?.receiver_id.some((id) => id.toString() === user_id)

    if (!isParticipant) {
      throw new ErrorWithStatus({
        messages: MESSAGES_MESSAGES.NOT_CONVERSATION_PARTICIPANT,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    // Check if message is pinned
    const pinnedMessage = await databaseService.pinnedMessages.findOne({
      message_id: new ObjectId(message_id)
    })

    if (!pinnedMessage) {
      throw new ErrorWithStatus({
        messages: 'Message is not pinned',
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Unpin the message
    await databaseService.pinnedMessages.deleteOne({
      message_id: new ObjectId(message_id)
    })

    return { message: 'Message unpinned successfully' }
  }

  async getPinnedMessages(user_id: string, conversation_id: string) {
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
      conversation.sender_id.toString() === user_id ||
      conversation.receiver_id.some((id) => id.toString() === user_id)

    if (!isParticipant) {
      throw new ErrorWithStatus({
        messages: MESSAGES_MESSAGES.NOT_CONVERSATION_PARTICIPANT,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    // Get pinned messages with full message details
    const pinnedMessages = await databaseService.pinnedMessages
      .aggregate([
        {
          $match: { conversation_id: new ObjectId(conversation_id) }
        },
        {
          $lookup: {
            from: 'messages',
            localField: 'message_id',
            foreignField: '_id',
            as: 'message_details'
          }
        },
        {
          $unwind: '$message_details'
        },
        {
          $lookup: {
            from: 'users',
            localField: 'message_details.sender_id',
            foreignField: '_id',
            as: 'sender_info'
          }
        },
        {
          $unwind: '$sender_info'
        },
        {
          $sort: { created_at: 1 }
        }
      ])
      .toArray()

    return { pinned_messages: pinnedMessages }
  }

  // Reaction functionality
  async addReaction(user_id: string, message_id: string, reaction_type: ReactionStatus) {
    // Verify message exists
    const message = await databaseService.messages.findOne({
      _id: new ObjectId(message_id)
    })

    if (!message) {
      throw new ErrorWithStatus({
        messages: MESSAGES_MESSAGES.MESSAGE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Verify user is participant in conversation
    const conversation = await databaseService.conversations.findOne({
      _id: message.conversation_id
    })

    const isParticipant =
      conversation?.sender_id.toString() === user_id ||
      conversation?.receiver_id.some((id) => id.toString() === user_id)

    if (!isParticipant) {
      throw new ErrorWithStatus({
        messages: MESSAGES_MESSAGES.NOT_CONVERSATION_PARTICIPANT,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    // Check if user already reacted to this message
    const existingReaction = await databaseService.messageReactions.findOne({
      message_id: new ObjectId(message_id),
      user_id: new ObjectId(user_id)
    })

    if (existingReaction) {
      // Update existing reaction
      await databaseService.messageReactions.updateOne(
        {
          message_id: new ObjectId(message_id),
          user_id: new ObjectId(user_id)
        },
        {
          $set: {
            reaction_type: reaction_type,
            created_at: new Date()
          }
        }
      )
      return { message: 'Reaction updated successfully' }
    } else {
      // Add new reaction
      const reaction = new MessageReaction({
        _id: new ObjectId(),
        message_id: new ObjectId(message_id),
        user_id: new ObjectId(user_id),
        reaction_type: reaction_type
      })

      await databaseService.messageReactions.insertOne(reaction)
      
      // Create notification for message sender (if not reacting to own message)
      if (message.sender_id.toString() !== user_id) {
        const reactionEmoji = this.getReactionEmoji(reaction_type)
        await notificationsServices.createReactionNotification(
          message.sender_id.toString(),
          user_id,
          message_id,
          'message',
          reactionEmoji
        )
      }
      
      return { message: 'Reaction added successfully', reaction }
    }
  }

  async removeReaction(user_id: string, message_id: string) {
    const result = await databaseService.messageReactions.deleteOne({
      message_id: new ObjectId(message_id),
      user_id: new ObjectId(user_id)
    })

    if (result.deletedCount === 0) {
      throw new ErrorWithStatus({
        messages: 'Reaction not found',
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return { message: 'Reaction removed successfully' }
  }

  async getMessageReactions(user_id: string, message_id: string) {
    // Verify message exists and user is participant
    const message = await databaseService.messages.findOne({
      _id: new ObjectId(message_id)
    })

    if (!message) {
      throw new ErrorWithStatus({
        messages: MESSAGES_MESSAGES.MESSAGE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const conversation = await databaseService.conversations.findOne({
      _id: message.conversation_id
    })

    const isParticipant =
      conversation?.sender_id.toString() === user_id ||
      conversation?.receiver_id.some((id) => id.toString() === user_id)

    if (!isParticipant) {
      throw new ErrorWithStatus({
        messages: MESSAGES_MESSAGES.NOT_CONVERSATION_PARTICIPANT,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    // Get reactions with user info
    const reactions = await databaseService.messageReactions
      .aggregate([
        {
          $match: { message_id: new ObjectId(message_id) }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_info'
          }
        },
        {
          $unwind: '$user_info'
        },
        {
          $group: {
            _id: '$reaction_type',
            count: { $sum: 1 },
            users: {
              $push: {
                _id: '$user_info._id',
                username: '$user_info.username',
                avatar: '$user_info.avatar'
              }
            }
          }
        }
      ])
      .toArray()

    return { reactions }
  }

  // Helper method to get emoji for reaction type
  private getReactionEmoji(reaction_type: ReactionStatus): string {
    switch (reaction_type) {
      case ReactionStatus.like:
        return '👍'
      case ReactionStatus.love:
        return '❤️'
      case ReactionStatus.haha:
        return '😂'
      case ReactionStatus.wow:
        return '😮'
      case ReactionStatus.sad:
        return '😢'
      case ReactionStatus.angry:
        return '😠'
      default:
        return '👍'
    }
  }
}

const messagesServices = new MessagesServices()
export default messagesServices
