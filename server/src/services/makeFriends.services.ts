import MakeFriend from '~/models/schemas/makeFriends.schema'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'

class MakeFriendServices {
  async addFriend(friend_id: string, user_id: string) {
    const _id = new ObjectId()
    const add_friend = await databaseService.makeFriend.insertOne(
      new MakeFriend({
        _id,
        friend_id: new ObjectId(friend_id),
        user_id: new ObjectId(user_id)
      })
    )
    const friend = await databaseService.makeFriend.findOne({
      _id: new ObjectId(add_friend.insertedId)
    })
    return friend
  }
  async unFriend(friend_id: string, user_id: string) {
    await databaseService.makeFriend.deleteOne({
      friend_id: new ObjectId(friend_id),
      user_id: new ObjectId(user_id)
    })
  }
}

const makeFriendServices = new MakeFriendServices()
export default makeFriendServices
