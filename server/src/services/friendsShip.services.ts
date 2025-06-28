import friendShip from '~/models/schemas/friendsShip.schema'
import databaseService from './database.services'
import notificationsServices from './notifications.services'
import { ObjectId } from 'mongodb'
import { FriendsShipStatus } from '~/constants/enum'

class FriendsShipServices {
  async addFriend(friend_id: string, user_id: string) {
    // Kiểm tra xem có record cũ với status rejected không
    const existingFriendship = await databaseService.friendShip.findOne({
      friend_id: new ObjectId(friend_id),
      user_id: new ObjectId(user_id),
      status: FriendsShipStatus.rejected
    })
    
    if (existingFriendship) {
      // Nếu có record cũ bị reject, update lại thành pending
      const updatedFriendship = await databaseService.friendShip.findOneAndUpdate(
        { _id: existingFriendship._id },
        {
          $set: {
            status: FriendsShipStatus.pending
          },
          $currentDate: {
            updated_at: true
          }
        },
        { returnDocument: 'after' }
      )
      return updatedFriendship
    } else {
      // Nếu không có record cũ, tạo mới
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
      
      // Create notification for friend request
      await notificationsServices.createFriendRequestNotification(friend_id, user_id)
      
      return friend
    }
  }
  async unFriend(friendship_id: string, user_id: string) {
    const result = await databaseService.friendShip.deleteOne({
      _id: new ObjectId(friendship_id),
      $or: [
        { user_id: new ObjectId(user_id) },    // Người gửi request
        { friend_id: new ObjectId(user_id) }   // Người nhận request  
      ],
      status: FriendsShipStatus.accepted       // Chỉ có thể unfriend khi đã accepted
    })
    return result
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
  }  async getAllFriends(user_id: string, limit: number, page: number) {
    const pipeline = [
      {
        $match: {
          $or: [
            {
              user_id: new ObjectId(user_id),
              status: FriendsShipStatus.accepted
            },
            {
              friend_id: new ObjectId(user_id),
              status: FriendsShipStatus.accepted
            }
          ]
        }
      },
      {
        $addFields: {
          // Tính toán friend_user_id: nếu user_id = current user thì lấy friend_id, ngược lại lấy user_id
          friend_user_id: {
            $cond: {
              if: { $eq: ['$user_id', new ObjectId(user_id)] },
              then: '$friend_id',
              else: '$user_id'
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'friend_user_id',
          foreignField: '_id',
          as: 'friend_info'
        }
      },
      {
        $unwind: '$friend_info'
      },
      {
        $project: {
          _id: 1,
          user_id: 1,
          friend_id: 1,
          status: 1,
          activeStatus: 1,
          created_at: 1,
          updated_at: 1,
          'friend_info._id': 1,
          'friend_info.email': 1,
          'friend_info.username': 1,
          'friend_info.avatar': 1,
          'friend_info.bio': 1,
          'friend_info.verify': 1
        }
      },
      {
        $skip: limit * (page - 1)
      },
      {
        $limit: limit
      }
    ]

    const friends = await databaseService.friendShip.aggregate(pipeline).toArray()
    
    // Đếm tổng số friends (không áp dụng skip/limit)
    const total = await databaseService.friendShip.countDocuments({
      $or: [
        {
          user_id: new ObjectId(user_id),
          status: FriendsShipStatus.accepted
        },
        {
          friend_id: new ObjectId(user_id),
          status: FriendsShipStatus.accepted
        }
      ]
    })
    
    return { friends, total: total || 0 }
  }
  async getFriendRequests(user_id: string, limit: number, page: number) {
    // Sử dụng aggregation pipeline để join với users collection và lấy thông tin người gửi
    const pipeline = [
      {
        $match: {
          friend_id: new ObjectId(user_id),
          status: FriendsShipStatus.pending
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',  // Lấy thông tin người gửi (user_id)
          foreignField: '_id',
          as: 'sender_info'
        }
      },
      {
        $unwind: '$sender_info'
      },
      {
        $project: {
          _id: 1,
          user_id: 1,
          friend_id: 1,
          status: 1,
          activeStatus: 1,
          created_at: 1,
          updated_at: 1,
          'sender_info._id': 1,
          'sender_info.email': 1,
          'sender_info.username': 1,
          'sender_info.avatar': 1,
          'sender_info.bio': 1,
          'sender_info.verify': 1
        }
      },
      {
        $skip: limit * (page - 1)
      },
      {
        $limit: limit
      }
    ]

    const friend_requests = await databaseService.friendShip.aggregate(pipeline).toArray()
    
    // Đếm tổng số friend requests
    const total = await databaseService.friendShip.countDocuments({
      friend_id: new ObjectId(user_id),
      status: FriendsShipStatus.pending
    })
    
    return { friend_requests, total: total || 0 }
  }
  async acceptFriendRequest(friendship_id: string, user_id: string) {
    const result = await databaseService.friendShip.findOneAndUpdate(
      {
        _id: new ObjectId(friendship_id),
        friend_id: new ObjectId(user_id), // Chỉ người nhận mới có thể accept
        status: FriendsShipStatus.pending
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
    
    // Create notification for friend request accepted
    if (result && result.user_id) {
      await notificationsServices.createFriendAcceptedNotification(result.user_id.toString(), user_id)
    }
    
    return result
  }
  async rejectFriendRequest(friendship_id: string, user_id: string) {
    const result = await databaseService.friendShip.findOneAndUpdate(
      {
        _id: new ObjectId(friendship_id),
        friend_id: new ObjectId(user_id), // Chỉ người nhận mới có thể reject
        status: FriendsShipStatus.pending
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
    // Sử dụng aggregation pipeline để tìm trong danh sách bạn bè và search theo username, bio, email
    const pipeline = [
      {
        $match: {
          $or: [
            {
              user_id: new ObjectId(user_id),
              status: FriendsShipStatus.accepted
            },
            {
              friend_id: new ObjectId(user_id),
              status: FriendsShipStatus.accepted
            }
          ]
        }
      },
      {
        $addFields: {
          // Tính toán friend_user_id: nếu user_id = current user thì lấy friend_id, ngược lại lấy user_id
          friend_user_id: {
            $cond: {
              if: { $eq: ['$user_id', new ObjectId(user_id)] },
              then: '$friend_id',
              else: '$user_id'
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'friend_user_id',
          foreignField: '_id',
          as: 'friend_info'
        }
      },
      {
        $unwind: '$friend_info'
      },
      {
        $match: {
          $or: [
            { 'friend_info.username': { $regex: search, $options: 'i' } },
            { 'friend_info.bio': { $regex: search, $options: 'i' } },
            { 'friend_info.email': { $regex: search, $options: 'i' } }
          ]
        }
      },
      {
        $project: {
          _id: 1,
          user_id: 1,
          friend_id: 1,
          status: 1,
          activeStatus: 1,
          created_at: 1,
          updated_at: 1,
          'friend_info._id': 1,
          'friend_info.email': 1,
          'friend_info.username': 1,
          'friend_info.avatar': 1,
          'friend_info.bio': 1,
          'friend_info.verify': 1
        }
      },
      {
        $skip: limit * (page - 1)
      },
      {
        $limit: limit
      }
    ]

    const friends = await databaseService.friendShip.aggregate(pipeline).toArray()
    
    // Đếm tổng số friends khớp với search
    const countPipeline = [
      {
        $match: {
          $or: [
            {
              user_id: new ObjectId(user_id),
              status: FriendsShipStatus.accepted
            },
            {
              friend_id: new ObjectId(user_id),
              status: FriendsShipStatus.accepted
            }
          ]
        }
      },
      {
        $addFields: {
          friend_user_id: {
            $cond: {
              if: { $eq: ['$user_id', new ObjectId(user_id)] },
              then: '$friend_id',
              else: '$user_id'
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'friend_user_id',
          foreignField: '_id',
          as: 'friend_info'
        }
      },
      {
        $unwind: '$friend_info'
      },
      {
        $match: {
          $or: [
            { 'friend_info.username': { $regex: search, $options: 'i' } },
            { 'friend_info.bio': { $regex: search, $options: 'i' } },
            { 'friend_info.email': { $regex: search, $options: 'i' } }
          ]
        }
      },
      {
        $count: 'total'
      }
    ]

    const countResult = await databaseService.friendShip.aggregate(countPipeline).toArray()
    const total = countResult.length > 0 ? countResult[0].total : 0
    
    return { friend_suggestions: friends, total: total || 0 }
  }
  async cancelFriendRequest(cancel_request_id: string, user_id: string) {
    const result = await databaseService.friendShip.deleteOne({
      _id: new ObjectId(cancel_request_id),
      user_id: new ObjectId(user_id), // Chỉ cho phép người gửi cancel
      status: FriendsShipStatus.pending // Chỉ có thể cancel request đang pending
    })
    return result
  }
  async getAllUsers(user_id: string, limit: number, page: number) {
    const users = await databaseService.users
      .find({
        _id: { $ne: new ObjectId(user_id) }, // Exclude current user
        verify: 1 // Only verified users
      })
      .skip(limit * (page - 1))
      .limit(limit)
      .project({
        password: 0, // Exclude password
        email_verify_token: 0,
        forgot_password_token: 0
      })
      .toArray()

    const total = await databaseService.users.countDocuments({
      _id: { $ne: new ObjectId(user_id) },
      verify: 1
    })

    return { users, total: total || 0 }
  }

  async searchUsers(user_id: string, search: string, limit: number, page: number) {
    const users = await databaseService.users
      .find({
        _id: { $ne: new ObjectId(user_id) }, // Exclude current user
        verify: 1, // Only verified users
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { bio: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      })
      .skip(limit * (page - 1))
      .limit(limit)
      .project({
        password: 0, // Exclude password
        email_verify_token: 0,
        forgot_password_token: 0
      })
      .toArray()

    const total = await databaseService.users.countDocuments({
      _id: { $ne: new ObjectId(user_id) },
      verify: 1,
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    })

    return { users, total: total || 0 }
  }
}

const friendsShipServices = new FriendsShipServices()
export default friendsShipServices
