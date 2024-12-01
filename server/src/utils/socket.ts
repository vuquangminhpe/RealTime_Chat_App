import { ExtendedError, Server, Socket } from 'socket.io'
import { verifyAccessToken } from './common'
import { TokenPayload } from '~/models/request/User.request'
import { ConversationsStatus, statusActivityType, UserVerifyStatus } from '~/constants/enum'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
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
    const { Authorization } = socket.handshake.auth
    const access_token = Authorization.split(' ')[1]
    try {
      const decode_authorization = await verifyAccessToken(access_token)
      const { user_id } = decode_authorization as TokenPayload
      const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
      if (user?.verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({ messages: USERS_MESSAGES.USER_NOT_VERIFIED, status: HTTP_STATUS.UNAUTHORIZED })
      }
      next()
    } catch (error) {
      next(error as ExtendedError)
    }
  })
  io.on('connection', async (socket: Socket) => {
    const { user_id } = socket.handshake.auth
    users[user_id] = { socket_id: socket.id }
    await databaseService.friendShip.updateOne(
      { user_id: new ObjectId(user_id as string) },
      { activeStatus: statusActivityType.online }
    )
    console.log(`User ${user_id} connected`)
    io.on('send-message', async (data) => {
      let t = ConversationsStatus.private
      const { sender_id, receiver_id, content } = data.payload
      if (receiver_id.length > 1) {
        t = ConversationsStatus.group
      }
      const receiver_socket_id = users[receiver_id]?.socket_id
      if (!receiver_socket_id) {
        return
      }
      const conversations = new Conversations({
        sender_id: new ObjectId(sender_id as string),
        receiver_id: [new ObjectId(receiver_id as string)],
        type: t,
        content: content
      })
      const result = await databaseService.conversations.insertOne(conversations)
      conversations._id = result.insertedId
      socket.to(receiver_socket_id).emit('receive-message', { payload: conversations })
    })
    socket.on('disconnect', async () => {
      delete users[user_id]
      await databaseService.friendShip.updateOne(
        { user_id: new ObjectId(user_id as string) },
        { activeStatus: statusActivityType.offline }
      )
      console.log(`User ${user_id} disconnected`)
    })
  })
}

export default initSocket
