import { ObjectId } from 'mongodb'
import { ConversationsStatus } from '~/constants/enum'
import Conversations from '~/models/schemas/conversation.schema'
import ConversationSettings from '~/models/schemas/conversationSetting.schema'
import databaseService from './database.services'
import { ErrorWithStatus } from '~/models/Errors'
import { CONVERSATIONS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { GroupMemberStatus } from '~/models/schemas/groupMember.schema'
import { MessageStatus } from '~/models/schemas/message.chema'

class ConversationsServices {
  async getConversation(user_id: string, receiver_ids: string[], type: string, limit: number, page: number) {
    let conversations: any[] = []
    let total = 0

    if (type === 'private') {
      // For private conversation, should be exactly one receiver
      if (receiver_ids.length !== 1) {
        throw new ErrorWithStatus({
          messages: 'Private conversation requires exactly one receiver',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      const receiver_id = receiver_ids[0]

      // Find existing private conversation
      const existingConversation = await databaseService.conversations.findOne({
        type: ConversationsStatus.private,
        $or: [
          {
            sender_id: new ObjectId(user_id),
            receiver_id: { $in: [new ObjectId(receiver_id)] }
          },
          {
            sender_id: new ObjectId(receiver_id),
            receiver_id: { $in: [new ObjectId(user_id)] }
          }
        ]
      })

      if (existingConversation) {
        // Get receiver info
        const receiverInfo = await databaseService.users.findOne(
          { _id: new ObjectId(receiver_id) },
          { projection: { username: 1, avatar: 1 } }
        )

        conversations = [
          {
            ...existingConversation,
            receiver_info: receiverInfo
          }
        ]
        total = 1
      }
    } else if (type === 'group') {
      // Find group conversations where user is participant
      const groupConversations = await databaseService.conversations
        .find({
          type: ConversationsStatus.group,
          $or: [{ sender_id: new ObjectId(user_id) }, { receiver_id: { $in: [new ObjectId(user_id)] } }]
        })
        .sort({ update_at: -1 })
        .skip(limit * (page - 1))
        .limit(limit)
        .toArray()

      // Get member count for each group
      conversations = await Promise.all(
        groupConversations.map(async (conv) => {
          const memberCount = await databaseService.groupMembers.countDocuments({
            group_id: conv._id,
            status: GroupMemberStatus.Active
          })

          return {
            ...conv,
            member_count: memberCount
          }
        })
      )

      total = await databaseService.conversations.countDocuments({
        type: ConversationsStatus.group,
        $or: [{ sender_id: new ObjectId(user_id) }, { receiver_id: { $in: [new ObjectId(user_id)] } }]
      })
    }

    return { conversations, total }
  }

  async getAllConversations(user_id: string, limit: number, page: number) {
    // Get all conversations where user is participant
    const conversations = await databaseService.conversations
      .find({
        $or: [{ sender_id: new ObjectId(user_id) }, { receiver_id: { $in: [new ObjectId(user_id)] } }]
      })
      .sort({ update_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    // Enhance conversations with additional info
    const enhancedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const additionalInfo: any = {}

        if (conversation.type === ConversationsStatus.private) {
          // Get the other participant info
          const otherParticipantId =
            conversation.sender_id.toString() === user_id ? conversation.receiver_id[0] : conversation.sender_id

          const otherParticipant = await databaseService.users.findOne(
            { _id: otherParticipantId },
            { projection: { username: 1, avatar: 1, bio: 1 } }
          )

          additionalInfo.other_participant = otherParticipant
        } else if (conversation.type === ConversationsStatus.group) {
          // Get member count
          const memberCount = await databaseService.groupMembers.countDocuments({
            group_id: conversation._id,
            status: GroupMemberStatus.Active
          })

          additionalInfo.member_count = memberCount
        }

        // Get user settings for this conversation
        const userSettings = await databaseService.conversationSettings?.findOne({
          user_id: new ObjectId(user_id),
          conversation_id: conversation._id
        })

        additionalInfo.settings = {
          pinned: userSettings?.pinned || false,
          muted: userSettings?.muted || false,
          muted_until: userSettings?.muted_until,
          archived: userSettings?.archived || false,
          notifications_enabled: userSettings?.notifications_enabled !== false
        }

        // Get unread message count
        const unreadCount = await databaseService.messages.countDocuments({
          conversation_id: conversation._id,
          sender_id: { $ne: new ObjectId(user_id) },
          status: { $ne: MessageStatus.Read }
        })

        additionalInfo.unread_count = unreadCount

        return {
          ...conversation,
          ...additionalInfo
        }
      })
    )

    const total = await databaseService.conversations.countDocuments({
      $or: [{ sender_id: new ObjectId(user_id) }, { receiver_id: { $in: [new ObjectId(user_id)] } }]
    })

    return { conversations: enhancedConversations, total }
  }

  async createPrivateConversation(user_id: string, receiver_id: string) {
    const receiver = await databaseService.users.findOne({ _id: new ObjectId(receiver_id) })
    if (!receiver) {
      throw new ErrorWithStatus({
        messages: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Create conversation
    const conversationId = new ObjectId()
    await databaseService.conversations.insertOne(
      new Conversations({
        _id: conversationId,
        sender_id: new ObjectId(user_id),
        receiver_id: [new ObjectId(receiver_id)],
        type: ConversationsStatus.private,
        content: 'Conversation started'
      })
    )

    const result = await databaseService.conversations.findOne({ _id: conversationId })

    // Get receiver info
    const receiverInfo = await databaseService.users.findOne(
      { _id: new ObjectId(receiver_id) },
      { projection: { username: 1, avatar: 1, bio: 1 } }
    )

    return {
      ...result,
      other_participant: receiverInfo
    }
  }

  async getConversationDetails(user_id: string, conversation_id: string) {
    const conversation = await databaseService.conversations.findOne({
      _id: new ObjectId(conversation_id)
    })

    if (!conversation) {
      throw new ErrorWithStatus({
        messages: CONVERSATIONS_MESSAGES.NO_CONVERSATION,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Verify user is participant
    const isParticipant =
      conversation.sender_id.toString() === user_id || conversation.receiver_id.some((id) => id.toString() === user_id)

    if (!isParticipant) {
      throw new ErrorWithStatus({
        messages: 'You are not a participant in this conversation',
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    const details: any = { ...conversation }

    if (conversation.type === ConversationsStatus.private) {
      // Get other participant
      const otherParticipantId =
        conversation.sender_id.toString() === user_id ? conversation.receiver_id[0] : conversation.sender_id

      const otherParticipant = await databaseService.users.findOne(
        { _id: otherParticipantId },
        { projection: { username: 1, avatar: 1, bio: 1 } }
      )

      details.other_participant = otherParticipant
    } else if (conversation.type === ConversationsStatus.group) {
      // Get group members
      const members = await databaseService.groupMembers
        .find({
          group_id: conversation._id,
          status: GroupMemberStatus.Active
        })
        .toArray()

      const membersWithUserInfo = await Promise.all(
        members.map(async (member) => {
          const user = await databaseService.users.findOne(
            { _id: member.user_id },
            { projection: { username: 1, avatar: 1 } }
          )
          return {
            ...member,
            user
          }
        })
      )

      details.members = membersWithUserInfo
      details.member_count = members.length
    }

    // Get user settings
    const userSettings = await databaseService.conversationSettings?.findOne({
      user_id: new ObjectId(user_id),
      conversation_id: conversation._id
    })

    details.settings = {
      pinned: userSettings?.pinned || false,
      muted: userSettings?.muted || false,
      muted_until: userSettings?.muted_until,
      archived: userSettings?.archived || false,
      notifications_enabled: userSettings?.notifications_enabled !== false
    }

    return details
  }

  async deleteConversation(user_id: string, conversation_id: string) {
    const conversation = await databaseService.conversations.findOne({
      _id: new ObjectId(conversation_id)
    })

    if (!conversation) {
      throw new ErrorWithStatus({
        messages: CONVERSATIONS_MESSAGES.NO_CONVERSATION,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (conversation.type === ConversationsStatus.group) {
      // For groups, only archive for user, don't delete entirely
      await this.archiveConversation(user_id, conversation_id)
    } else {
      // For private conversations, delete messages and conversation
      await databaseService.messages.deleteMany({
        conversation_id: new ObjectId(conversation_id)
      })

      await databaseService.conversations.deleteOne({
        _id: new ObjectId(conversation_id)
      })

      // Delete conversation settings
      await databaseService.conversationSettings?.deleteMany({
        conversation_id: new ObjectId(conversation_id)
      })
    }
  }

  async muteConversation(user_id: string, conversation_id: string, mute_until?: Date) {
    await this.upsertConversationSettings(user_id, conversation_id, {
      muted: true,
      muted_until: mute_until || (null as any)
    })

    return { muted: true, mute_until }
  }

  async unmuteConversation(user_id: string, conversation_id: string) {
    await this.upsertConversationSettings(user_id, conversation_id, {
      muted: false,
      muted_until: null as any
    })

    return { muted: false }
  }

  async pinConversation(user_id: string, conversation_id: string) {
    await this.upsertConversationSettings(user_id, conversation_id, {
      pinned: true,
      pinned_at: new Date()
    })

    return { pinned: true }
  }

  async unpinConversation(user_id: string, conversation_id: string) {
    await this.upsertConversationSettings(user_id, conversation_id, {
      pinned: false,
      pinned_at: null as any
    })

    return { pinned: false }
  }

  async archiveConversation(user_id: string, conversation_id: string) {
    await this.upsertConversationSettings(user_id, conversation_id, {
      archived: true,
      archived_at: new Date()
    })

    return { archived: true }
  }

  async searchConversations(user_id: string, search_term: string, limit: number, page: number) {
    const searchRegex = { $regex: search_term, $options: 'i' }

    // Search in conversation content and group names
    const conversations = await databaseService.conversations
      .find({
        $and: [
          {
            $or: [{ sender_id: new ObjectId(user_id) }, { receiver_id: { $in: [new ObjectId(user_id)] } }]
          },
          {
            $or: [{ content: searchRegex }, { group_name: searchRegex }]
          }
        ]
      })
      .sort({ update_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    // Enhance results with participant info
    const enhancedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        if (conversation.type === ConversationsStatus.private) {
          const otherParticipantId =
            conversation.sender_id.toString() === user_id ? conversation.receiver_id[0] : conversation.sender_id

          const otherParticipant = await databaseService.users.findOne(
            { _id: otherParticipantId },
            { projection: { username: 1, avatar: 1 } }
          )

          return {
            ...conversation,
            other_participant: otherParticipant
          }
        } else {
          const memberCount = await databaseService.groupMembers.countDocuments({
            group_id: conversation._id,
            status: GroupMemberStatus.Active
          })

          return {
            ...conversation,
            member_count: memberCount
          }
        }
      })
    )

    const total = await databaseService.conversations.countDocuments({
      $and: [
        {
          $or: [{ sender_id: new ObjectId(user_id) }, { receiver_id: { $in: [new ObjectId(user_id)] } }]
        },
        {
          $or: [{ content: searchRegex }, { group_name: searchRegex }]
        }
      ]
    })

    return { conversations: enhancedConversations, total }
  }

  private async upsertConversationSettings(
    user_id: string,
    conversation_id: string,
    updates: Partial<ConversationSettings>
  ) {
    const filter = {
      user_id: new ObjectId(user_id),
      conversation_id: new ObjectId(conversation_id)
    }

    const updateDoc = {
      $set: {
        ...updates,
        updated_at: new Date()
      },
      $setOnInsert: {
        user_id: new ObjectId(user_id),
        conversation_id: new ObjectId(conversation_id),
        created_at: new Date()
      }
    }

    await databaseService.conversationSettings?.updateOne(filter, updateDoc, { upsert: true })
  }
}

const conversationsServices = new ConversationsServices()
export default conversationsServices
