import friendShip from '~/models/schemas/friendsShip.schema'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import { FriendsShipStatus } from '~/constants/enum'

class FriendsShipServices {
  async addFriend(friend_id: string, user_id: string) {
    const _id = new ObjectId()
    const add_friend = await databaseService.friendShip.insertOne(
      new friendShip({
        _id,
        friend_id: new ObjectId(friend_id),
        user_id: new ObjectId(user_id),
        status: FriendsShipStatus.pending
      })
    )
    const friend = await databaseService.friendShip.findOne({
      _id: new ObjectId(add_friend.insertedId)
    })
    return friend
  }
  async unFriend(friend_id: string, user_id: string) {
    await databaseService.friendShip.deleteOne({
      friend_id: new ObjectId(friend_id),
      user_id: new ObjectId(user_id)
    })
  }
  async friendshipSuggestions(user_id: string, limit: number, page: number) {
    const friend = await databaseService.friendShip
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
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    const total = await databaseService.users.countDocuments(friend_suggestions)
    return { friend_suggestions, total: total || 0 }
  }
  async getAllFriends(user_id: string, limit: number, page: number) {
    const friends = await databaseService.friendShip
      .find({
        user_id: new ObjectId(user_id)
      })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    const total = await databaseService.friendShip.countDocuments(friends)
    return { friends, total: total || 0 }
  }
  async getFriendRequests(user_id: string) {
    const friend_requests = await databaseService.friendShip
      .find({
        friend_id: new ObjectId(user_id),
        status: FriendsShipStatus.pending
      })
      .toArray()
    return friend_requests
  }
  async acceptFriendRequest(friend_id: string, user_id: string) {
    const result = await databaseService.friendShip.findOneAndUpdate(
      {
        friend_id: new ObjectId(user_id),
        user_id: new ObjectId(friend_id)
      },
      {
        $set: {
          status: FriendsShipStatus.accepted
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return result
  }
  async rejectFriendRequest(friend_id: string, user_id: string) {
    const result = await databaseService.friendShip.findOneAndUpdate(
      {
        friend_id: new ObjectId(user_id),
        user_id: new ObjectId(friend_id)
      },
      {
        $set: {
          status: FriendsShipStatus.rejected
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return result
  }
  async searchFriends(user_id: string, search: string, limit: number, page: number) {
    const friends = await databaseService.friendShip
      .find({
        user_id: new ObjectId(user_id)
      })
      .toArray()
    const friend_suggestions = await databaseService.users
      .find({
        $and: [{ _id: { $nin: friends.map((f) => f.friend_id) } }, { username: { $regex: search, $options: 'i' } }]
      })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    const total = await databaseService.users.countDocuments(friend_suggestions)
    return { friend_suggestions, total: total || 0 }
  }
  async cancelFriendRequest(friend_id: string, user_id: string) {
    await databaseService.friendShip.deleteOne({
      friend_id: new ObjectId(friend_id),
      user_id: new ObjectId(user_id)
    })
  }
}

const friendsShipServices = new FriendsShipServices()
export default friendsShipServices
