import { ObjectId } from 'mongodb'
import Notification, { NotificationStatus, NotificationType } from '~/models/schemas/notification.schema'
import databaseService from './database.services'
import { ErrorWithStatus } from '~/models/Errors'
import { NOTIFICATIONS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'

interface CreateNotificationParams {
  recipient_id: string
  sender_id: string
  type: NotificationType
  title: string
  message: string
  data?: any
  target_id?: string
  target_type?: string
}

class NotificationsServices {
  async createNotification(params: CreateNotificationParams) {
    const { recipient_id, sender_id, type, title, message, data, target_id, target_type } = params

    // Don't create notification for self
    if (recipient_id === sender_id) {
      return null
    }

    const _id = new ObjectId()
    const notification = await databaseService.notifications.insertOne(
      new Notification({
        _id,
        recipient_id: new ObjectId(recipient_id),
        sender_id: new ObjectId(sender_id),
        type,
        title,
        message,
        data,
        target_id,
        target_type,
        status: NotificationStatus.Unread
      })
    )

    const result = await databaseService.notifications.findOne({ _id })

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

  async getNotifications(user_id: string, limit: number, page: number, status?: string) {
    const query: any = { recipient_id: new ObjectId(user_id) }

    if (status && Object.values(NotificationStatus).includes(status as NotificationStatus)) {
      query.status = status
    }

    const notifications = await databaseService.notifications
      .find(query)
      .sort({ created_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    // Get sender info for each notification
    const notificationsWithSenderInfo = await Promise.all(
      notifications.map(async (notification) => {
        const sender = await databaseService.users.findOne(
          { _id: notification.sender_id },
          { projection: { username: 1, avatar: 1 } }
        )
        return {
          ...notification,
          sender
        }
      })
    )

    const total = await databaseService.notifications.countDocuments(query)
    const unread_count = await this.getUnreadCount(user_id)

    return {
      notifications: notificationsWithSenderInfo,
      total,
      unread_count
    }
  }

  async markNotificationRead(user_id: string, notification_id: string) {
    const notification = await databaseService.notifications.findOne({
      _id: new ObjectId(notification_id),
      recipient_id: new ObjectId(user_id)
    })

    if (!notification) {
      throw new ErrorWithStatus({
        messages: NOTIFICATIONS_MESSAGES.NOTIFICATION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    await databaseService.notifications.updateOne(
      { _id: new ObjectId(notification_id) },
      {
        $set: {
          status: NotificationStatus.Read,
          read_at: new Date()
        }
      }
    )
  }

  async markAllRead(user_id: string) {
    const result = await databaseService.notifications.updateMany(
      {
        recipient_id: new ObjectId(user_id),
        status: NotificationStatus.Unread
      },
      {
        $set: {
          status: NotificationStatus.Read,
          read_at: new Date()
        }
      }
    )

    return result
  }

  async deleteNotification(user_id: string, notification_id: string) {
    const notification = await databaseService.notifications.findOne({
      _id: new ObjectId(notification_id),
      recipient_id: new ObjectId(user_id)
    })

    if (!notification) {
      throw new ErrorWithStatus({
        messages: NOTIFICATIONS_MESSAGES.NOTIFICATION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    await databaseService.notifications.deleteOne({
      _id: new ObjectId(notification_id)
    })
  }

  async getUnreadCount(user_id: string): Promise<number> {
    return await databaseService.notifications.countDocuments({
      recipient_id: new ObjectId(user_id),
      status: NotificationStatus.Unread
    })
  }

  async clearAllNotifications(user_id: string) {
    const result = await databaseService.notifications.deleteMany({
      recipient_id: new ObjectId(user_id)
    })

    return result
  }

  // Helper methods for creating specific notification types
  async createFriendRequestNotification(recipient_id: string, sender_id: string) {
    const sender = await databaseService.users.findOne(
      { _id: new ObjectId(sender_id) },
      { projection: { username: 1 } }
    )

    return this.createNotification({
      recipient_id,
      sender_id,
      type: NotificationType.FriendRequest,
      title: 'New Friend Request',
      message: `${sender?.username} sent you a friend request`,
      target_id: sender_id,
      target_type: 'user'
    })
  }

  async createFriendAcceptedNotification(recipient_id: string, sender_id: string) {
    const sender = await databaseService.users.findOne(
      { _id: new ObjectId(sender_id) },
      { projection: { username: 1 } }
    )

    return this.createNotification({
      recipient_id,
      sender_id,
      type: NotificationType.FriendAccepted,
      title: 'Friend Request Accepted',
      message: `${sender?.username} accepted your friend request`,
      target_id: sender_id,
      target_type: 'user'
    })
  }

  async createMessageNotification(recipient_id: string, sender_id: string, conversation_id: string, preview: string) {
    const sender = await databaseService.users.findOne(
      { _id: new ObjectId(sender_id) },
      { projection: { username: 1 } }
    )

    return this.createNotification({
      recipient_id,
      sender_id,
      type: NotificationType.MessageReceived,
      title: 'New Message',
      message: `${sender?.username}: ${preview.substring(0, 50)}${preview.length > 50 ? '...' : ''}`,
      target_id: conversation_id,
      target_type: 'conversation'
    })
  }

  async createLikeNotification(recipient_id: string, sender_id: string, target_id: string, target_type: string) {
    const sender = await databaseService.users.findOne(
      { _id: new ObjectId(sender_id) },
      { projection: { username: 1 } }
    )

    return this.createNotification({
      recipient_id,
      sender_id,
      type: NotificationType.Like,
      title: 'New Like',
      message: `${sender?.username} liked your ${target_type}`,
      target_id,
      target_type
    })
  }

  async createReactionNotification(
    recipient_id: string,
    sender_id: string,
    target_id: string,
    target_type: string,
    reaction: string
  ) {
    const sender = await databaseService.users.findOne(
      { _id: new ObjectId(sender_id) },
      { projection: { username: 1 } }
    )

    return this.createNotification({
      recipient_id,
      sender_id,
      type: NotificationType.Reaction,
      title: 'New Reaction',
      message: `${sender?.username} reacted ${reaction} to your ${target_type}`,
      target_id,
      target_type
    })
  }

  async createGroupInviteNotification(recipient_id: string, sender_id: string, group_id: string, group_name: string) {
    const sender = await databaseService.users.findOne(
      { _id: new ObjectId(sender_id) },
      { projection: { username: 1 } }
    )

    return this.createNotification({
      recipient_id,
      sender_id,
      type: NotificationType.GroupInvite,
      title: 'Group Invitation',
      message: `${sender?.username} added you to ${group_name}`,
      target_id: group_id,
      target_type: 'group'
    })
  }
}

const notificationsServices = new NotificationsServices()
export default notificationsServices
