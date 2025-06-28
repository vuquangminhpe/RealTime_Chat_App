import { Server } from 'socket.io'

interface NotificationData {
  type: string
  title: string
  message: string
  target_id?: string
  target_type?: string
  sender_id?: string
}

class SocketNotificationManager {
  private static instance: SocketNotificationManager
  private io: Server | null = null
  private users: { [key: string]: { socket_id: string } } = {}

  public static getInstance(): SocketNotificationManager {
    if (!SocketNotificationManager.instance) {
      SocketNotificationManager.instance = new SocketNotificationManager()
    }
    return SocketNotificationManager.instance
  }

  public setSocketIO(io: Server, users: { [key: string]: { socket_id: string } }): void {
    this.io = io
    this.users = users
  }

  public emitNotificationToUser(userId: string, notification: NotificationData): void {
    if (this.io && this.users[userId]) {
      this.io.to(this.users[userId].socket_id).emit('new-notification', notification)
    }
  }

  public emitFriendRequestNotification(recipientId: string, senderUsername: string, senderId: string): void {
    this.emitNotificationToUser(recipientId, {
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${senderUsername} sent you a friend request`,
      target_id: senderId,
      target_type: 'user',
      sender_id: senderId
    })
  }

  public emitFriendAcceptedNotification(recipientId: string, senderUsername: string, senderId: string): void {
    this.emitNotificationToUser(recipientId, {
      type: 'friend_accepted',
      title: 'Friend Request Accepted',
      message: `${senderUsername} accepted your friend request`,
      target_id: senderId,
      target_type: 'user',
      sender_id: senderId
    })
  }

  public emitMessageNotification(recipientId: string, senderUsername: string, content: string, conversationId: string, senderId: string): void {
    this.emitNotificationToUser(recipientId, {
      type: 'message_received',
      title: 'New Message',
      message: `${senderUsername}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
      target_id: conversationId,
      target_type: 'conversation',
      sender_id: senderId
    })
  }

  public emitReactionNotification(recipientId: string, senderUsername: string, reaction: string, targetId: string, targetType: string, senderId: string): void {
    this.emitNotificationToUser(recipientId, {
      type: 'reaction',
      title: 'New Reaction',
      message: `${senderUsername} reacted ${reaction} to your ${targetType}`,
      target_id: targetId,
      target_type: targetType,
      sender_id: senderId
    })
  }

  public emitGroupInviteNotification(recipientId: string, senderUsername: string, groupName: string, groupId: string, senderId: string): void {
    this.emitNotificationToUser(recipientId, {
      type: 'group_invite',
      title: 'Group Invitation',
      message: `${senderUsername} added you to ${groupName}`,
      target_id: groupId,
      target_type: 'group',
      sender_id: senderId
    })
  }
}

export default SocketNotificationManager.getInstance()
