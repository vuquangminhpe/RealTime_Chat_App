import { ObjectId } from 'mongodb'
import { ConversationsStatus } from '~/constants/enum'
import databaseService from './database.services'

class ConversationServices {
  async getConversations({
    sender_id,
    receiver_id,
    limit,
    page,
    type
  }: {
    sender_id: string
    receiver_id: string[]
    limit: number
    page: number
    type: ConversationsStatus
  }) {
    const match = {
      $or: [
        { sender_id: new ObjectId(sender_id), receiver_id: { $in: receiver_id.map((id) => new ObjectId(id)) } },
        {
          receiver_id: { $in: receiver_id.map((id) => new ObjectId(id)) },
          receive_id: new ObjectId(sender_id)
        }
      ]
    }
    const conversations = await databaseService.conversations
      .find(match)
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    const total = await databaseService.conversations.countDocuments(match)
    return { conversations, total: total || 0 }
  }
  async getAllConversations(sender_id: string, page: number, limit: number) {
    const conversations = await databaseService.conversations
      .find({
        $or: [{ sender_id: new ObjectId(sender_id) }, { receiver_id: new ObjectId(sender_id) }]
      })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    const total = await databaseService.conversations.countDocuments({
      conversations
    })
    return { conversations, total: total || 0 }
  }
}
const conversationServices = new ConversationServices()
export default conversationServices
