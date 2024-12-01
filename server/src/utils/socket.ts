import { Server, Socket } from 'socket.io'
import { verifyAccessToken } from './common'
import { TokenPayload } from '~/models/request/User.request'
import { ConversationsStatus, statusActivityType, UserVerifyStatus } from '~/constants/enum'

import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.services'
import { Server as ServerHttp } from 'http'
import Conversations from '~/models/schemas/conversation.schema'

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

      try {
        await databaseService.friendShip.updateOne(
          { user_id: new ObjectId(user_id as string) },
          { activeStatus: statusActivityType.online }
        )
      } catch (updateError) {
        console.error(`Error updating online status for user ${user_id}:`, updateError)
      }

      console.log(`User ${user_id} connected`)

      socket.on('send-message', async (data) => {
        try {
          // Kiểm tra dữ liệu đầu vào
          if (!data || !data.payload) {
            console.error('Invalid message data')
            return
          }

          let t = ConversationsStatus.private
          const { sender_id, receiver_id, content } = data.payload

          if (!sender_id || !receiver_id || !content) {
            console.error('Incomplete message data')
            return
          }

          if (receiver_id.length > 1) {
            t = ConversationsStatus.group
          }

          const receiver_socket_id = users[receiver_id]?.socket_id
          if (!receiver_socket_id) {
            console.log(`Receiver ${receiver_id} is not online`)
            return
          }

          const conversations = new Conversations({
            sender_id: new ObjectId(sender_id as string),
            receiver_id: [new ObjectId(receiver_id as string)],
            type: t,
            content: content
          })

          try {
            const result = await databaseService.conversations.insertOne(conversations)
            conversations._id = result.insertedId
            socket.to(receiver_socket_id).emit('receive-message', { payload: conversations })
          } catch (dbError) {
            console.error('Error saving conversation:', dbError)
          }
        } catch (messageError) {
          console.error('Error processing message:', messageError)
        }
      })

      socket.on('disconnect', async () => {
        try {
          delete users[user_id]

          await databaseService.friendShip.updateOne(
            { user_id: new ObjectId(user_id as string) },
            { activeStatus: statusActivityType.offline }
          )
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
