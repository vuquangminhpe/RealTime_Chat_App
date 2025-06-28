import { Server, Socket } from 'socket.io'
import { verifyAccessToken } from './common'
import { TokenPayload } from '~/models/request/User.request'
import { statusActivityType } from '~/constants/enum'
import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.services'
import notificationsServices from '~/services/notifications.services'
import socketNotificationManager from './socketNotification'
import { Server as ServerHttp } from 'http'
import Message, { MessageStatus, MessageTypes } from '~/models/schemas/message.chema'

const initSocket = (httpServer: ServerHttp) => {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3002'
    }
  })

  const users: {
    [key: string]: {
      socket_id: string
    }
  } = {}

  // Initialize notification manager with socket instance
  socketNotificationManager.setSocketIO(io, users)

  io.use(async (socket, next) => {
    try {
      const { Authorization } = socket.handshake.auth

      if (!Authorization) {
        return next(new Error('Authentication token is missing'))
      }

      const access_token = Authorization.split(' ')[1]

      if (!access_token) {
        return next(new Error('Invalid authentication token format'))
      }

      try {
        const decode_authorization = await verifyAccessToken(access_token)
        const { user_id } = decode_authorization as TokenPayload

        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
        if (!user) {
          return next(new Error('User not found'))
        }

        socket.handshake.auth.user_id = user_id
        next()
      } catch (verifyError) {
        return next(new Error('Invalid or expired token'))
      }
    } catch (error) {
      console.error('Authentication middleware error:', error)
      return next(new Error('Internal authentication error'))
    }
  })

  io.on('connection', async (socket: Socket) => {
    try {
      const { user_id } = socket.handshake.auth

      if (!user_id) {
        socket.disconnect(true)
        return
      }

      users[user_id] = { socket_id: socket.id }

      // Update user online status
      try {
        await databaseService.friendShip.updateMany(
          { user_id: new ObjectId(user_id as string) },
          { $set: { activeStatus: statusActivityType.online } }
        )
      } catch (updateError) {
        console.error(`Error updating online status for user ${user_id}:`, updateError)
      }

      console.log(`User ${user_id} connected`)

      // Handle sending messages
      socket.on('send-message', async (data) => {
        try {
          if (!data || !data.payload) {
            console.error('Invalid message data')
            return
          }

          const { conversation_id, content, message_type, medias, reply_to } = data.payload

          if (!conversation_id || !content) {
            console.error('Incomplete message data')
            return
          }

          const conversation = await databaseService.conversations.findOne({
            _id: new ObjectId(conversation_id as string)
          })

          if (!conversation) {
            socket.emit('error', { message: 'Conversation not found' })
            return
          }

          const isParticipant =
            conversation.sender_id.toString() === user_id ||
            conversation.receiver_id.some((id) => id.toString() === user_id)

          if (!isParticipant) {
            socket.emit('error', { message: 'Not a participant in this conversation' })
            return
          }

          // Create message
          const messageId = new ObjectId()
          const message = new Message({
            _id: messageId,
            conversation_id: new ObjectId(conversation_id),
            sender_id: new ObjectId(user_id),
            content,
            message_type: message_type || MessageTypes.Text,
            medias: medias || [],
            reply_to: reply_to ? new ObjectId(reply_to) : undefined,
            status: MessageStatus.Sent
          })

          // Save message to database
          await databaseService.messages.insertOne(message)

          // Update conversation
          await databaseService.conversations.updateOne(
            { _id: new ObjectId(conversation_id as string) },
            {
              $set: {
                content: content,
                update_at: new Date()
              }
            }
          )

          // Get sender info
          const sender = await databaseService.users.findOne(
            { _id: new ObjectId(user_id as string) },
            { projection: { username: 1, avatar: 1 } }
          )

          const messageWithSender = {
            ...message,
            sender
          }

          // Send message to all participants
          const participants = [
            conversation.sender_id.toString(),
            ...conversation.receiver_id.map((id) => id.toString())
          ]

          participants.forEach((participantId) => {
            if (users[participantId]) {
              if (participantId === user_id) {
                // Send confirmation to sender
                socket.emit('message-sent', { payload: messageWithSender })
              } else {
                // Send to other participants
                socket.to(users[participantId].socket_id).emit('receive-message', {
                  payload: messageWithSender
                })
              }
            }
          })

          // Mark message as delivered for online users
          const onlineParticipants = participants.filter((id) => users[id] && id !== user_id)
          if (onlineParticipants.length > 0) {
            await databaseService.messages.updateOne({ _id: messageId }, { $set: { status: MessageStatus.Delivered } })
          }

          // Create notifications for other participants (not sender)
          const otherParticipants = [
            conversation.sender_id.toString(),
            ...conversation.receiver_id.map((id) => id.toString())
          ].filter(id => id !== user_id)
          
          for (const participant_id of otherParticipants) {
            await notificationsServices.createMessageNotification(
              participant_id, 
              user_id, 
              conversation_id, 
              content
            )
            
            // Emit real-time notification using notification manager
            socketNotificationManager.emitMessageNotification(
              participant_id,
              sender?.username || 'Unknown',
              content,
              conversation_id,
              user_id
            )
          }
        } catch (messageError) {
          console.error('Error processing message:', messageError)
          socket.emit('error', { message: 'Failed to send message' })
        }
      })

      // Handle message read status
      socket.on('mark-message-read', async (data) => {
        try {
          const { conversation_id } = data

          // Mark messages as read
          await databaseService.messages.updateMany(
            {
              conversation_id: new ObjectId(conversation_id as string),
              sender_id: { $ne: new ObjectId(user_id as string) },
              status: { $ne: MessageStatus.Read }
            },
            {
              $set: {
                status: MessageStatus.Read,
                updated_at: new Date()
              }
            }
          )

          // Notify other participants about read status
          const conversation = await databaseService.conversations.findOne({
            _id: new ObjectId(conversation_id as string)
          })

          if (conversation) {
            const participants = [
              conversation.sender_id.toString(),
              ...conversation.receiver_id.map((id) => id.toString())
            ]

            participants.forEach((participantId) => {
              if (users[participantId] && participantId !== user_id) {
                socket.to(users[participantId].socket_id).emit('messages-read', {
                  conversation_id,
                  read_by: user_id
                })
              }
            })
          }
        } catch (error) {
          console.error('Error marking messages as read:', error)
        }
      })

      // Handle typing indicators
      socket.on('typing-start', (data) => {
        const { conversation_id } = data
        socket.to(`conversation-${conversation_id}`).emit('user-typing', {
          user_id,
          typing: true
        })
      })

      socket.on('typing-stop', (data) => {
        const { conversation_id } = data
        socket.to(`conversation-${conversation_id}`).emit('user-typing', {
          user_id,
          typing: false
        })
      })

      // Handle joining conversation rooms
      socket.on('join-conversation', (data) => {
        const { conversation_id } = data
        socket.join(`conversation-${conversation_id}`)
      })

      // Handle leaving conversation rooms
      socket.on('leave-conversation', (data) => {
        const { conversation_id } = data
        socket.leave(`conversation-${conversation_id}`)
      })

      // Handle reactions
      socket.on('add-reaction', async (data) => {
        try {
          const { target_id, target_type, reaction_type } = data

          // Broadcast reaction to relevant users
          const targetRoom = `${target_type}-${target_id}`
          socket.to(targetRoom).emit('reaction-added', {
            target_id,
            target_type,
            reaction_type,
            user_id
          })
        } catch (error) {
          console.error('Error handling reaction:', error)
        }
      })

      // Handle user status changes
      socket.on('status-change', async (data) => {
        try {
          const { status } = data

          await databaseService.friendShip.updateMany(
            { user_id: new ObjectId(user_id as string) },
            { $set: { activeStatus: status } }
          )

          // Notify friends about status change
          const friends = await databaseService.friendShip.find({ friend_id: new ObjectId(user_id) }).toArray()

          friends.forEach((friend) => {
            if (users[friend.user_id.toString()]) {
              socket.to(users[friend.user_id.toString()].socket_id).emit('friend-status-change', {
                user_id,
                status
              })
            }
          })
        } catch (error) {
          console.error('Error updating status:', error)
        }
      })

      socket.on('disconnect', async () => {
        try {
          delete users[user_id]

          // Update user offline status
          await databaseService.friendShip.updateMany(
            { user_id: new ObjectId(user_id as string) },
            { $set: { activeStatus: statusActivityType.offline } }
          )

          // Notify friends about offline status
          const friends = await databaseService.friendShip.find({ friend_id: new ObjectId(user_id) }).toArray()

          friends.forEach((friend) => {
            if (users[friend.user_id.toString()]) {
              socket.to(users[friend.user_id.toString()].socket_id).emit('friend-status-change', {
                user_id,
                status: statusActivityType.offline
              })
            }
          })

          console.log(`User ${user_id} disconnected`)
        } catch (disconnectError) {
          console.error(`Error during user ${user_id} disconnection:`, disconnectError)
        }
      })
    } catch (connectionError) {
      console.error('Socket connection error:', connectionError)
      socket.disconnect(true)
    }
  })

  io.on('error', (error) => {
    console.error('Socket.IO server error:', error)
  })

  return io
}

export default initSocket
