import MakeFriend from '~/models/schemas/makeFriends.schema'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import { MakeFriendStatus } from '~/constants/enum'

class MakeFriendServices {
  async addFriend(friend_id: string, user_id: string) {
    const _id = new ObjectId()
    const add_friend = await databaseService.makeFriend.insertOne(
      new MakeFriend({
        _id,
        friend_id: new ObjectId(friend_id),
        user_id: new ObjectId(user_id),
        status: MakeFriendStatus.pending
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
  async friendshipSuggestions(user_id: string) {
    const friend = await databaseService.makeFriend
      .find({
        user_id: new ObjectId(user_id)
      })
      .toArray()
    const friend_suggestions = await databaseService.users
      .find({
        _id: {
          $nin: friend.map((f) => f.friend_id)
        }
      })
      .toArray()
    return friend_suggestions
  }
  async getAllFriends(user_id: string) {
    const friends = await databaseService.makeFriend
      .find({
        user_id: new ObjectId(user_id)
      })
      .toArray()
    return friends
  }
  async getFriendRequests(user_id: string) {
    const friend_requests = await databaseService.makeFriend
      .find({
        friend_id: new ObjectId(user_id),
        status: MakeFriendStatus.pending
      })
      .toArray()
    return friend_requests
  }
  async acceptFriendRequest(friend_id: string, user_id: string) {
    await databaseService.makeFriend.updateOne(
      {
        friend_id: new ObjectId(user_id),
        user_id: new ObjectId(friend_id)
      },
      {
        $set: {
          status: MakeFriendStatus.accepted
        }
      }
    )
  }
}

const makeFriendServices = new MakeFriendServices()
export default makeFriendServices
