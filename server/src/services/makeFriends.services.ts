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
}

const makeFriendServices = new MakeFriendServices()
export default makeFriendServices
