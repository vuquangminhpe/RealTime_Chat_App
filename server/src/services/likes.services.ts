import { ObjectId } from 'mongodb'
import { LikeReqBody } from '~/models/request/Likes.requests'
import Like, { LikeTargetTypes } from '~/models/schemas/like.schema'
import databaseService from './database.services'
import { ErrorWithStatus } from '~/models/Errors'
import { LIKES_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'

class LikesServices {
  async like(user_id: string, body: LikeReqBody) {
    const { target_id, target_type } = body

    // Check if user already liked this target
    const existingLike = await databaseService.likes.findOne({
      user_id: new ObjectId(user_id),
      target_id,
      target_type
    })

    if (existingLike) {
      throw new ErrorWithStatus({
        messages: LIKES_MESSAGES.ALREADY_LIKED,
        status: HTTP_STATUS.CONFLICT
      })
    }

    // Verify target exists based on type
    await this.verifyTargetExists(target_id, target_type)

    const _id = new ObjectId()
    const like = await databaseService.likes.insertOne(
      new Like({
        _id,
        user_id: new ObjectId(user_id),
        target_id,
        target_type
      })
    )

    const result = await databaseService.likes.findOne({ _id })

    // Get user info
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      { projection: { username: 1, avatar: 1 } }
    )

    return {
      ...result,
      user
    }
  }

  async unlike(user_id: string, target_id: string, target_type: LikeTargetTypes) {
    const like = await databaseService.likes.findOne({
      user_id: new ObjectId(user_id),
      target_id,
      target_type
    })

    if (!like) {
      throw new ErrorWithStatus({
        messages: LIKES_MESSAGES.LIKE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    await databaseService.likes.deleteOne({
      user_id: new ObjectId(user_id),
      target_id,
      target_type
    })
  }

  async getLikes(target_id: string, target_type: string, limit: number, page: number) {
    const likes = await databaseService.likes
      .find({ target_id, target_type })
      .sort({ created_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    // Get user info for each like
    const likesWithUserInfo = await Promise.all(
      likes.map(async (like) => {
        const user = await databaseService.users.findOne(
          { _id: like.user_id },
          { projection: { username: 1, avatar: 1 } }
        )
        return {
          ...like,
          user
        }
      })
    )

    const total = await databaseService.likes.countDocuments({ target_id, target_type })

    return { likes: likesWithUserInfo, total }
  }

  async getUserLikes(user_id: string, limit: number, page: number) {
    const likes = await databaseService.likes
      .find({ user_id: new ObjectId(user_id) })
      .sort({ created_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    // Get target info for each like
    const likesWithTargetInfo = await Promise.all(
      likes.map(async (like) => {
        let target = null
        let targetUser = null

        switch (like.target_type) {
          case LikeTargetTypes.Story:
            target = await databaseService.stories.findOne({ _id: like.target_id })
            if (target) {
              targetUser = await databaseService.users.findOne(
                { _id: new ObjectId(target.user_id) },
                { projection: { username: 1, avatar: 1 } }
              )
            }
            break
          case LikeTargetTypes.Message:
            target = await databaseService.messages.findOne({ _id: new ObjectId(like.target_id) })
            if (target) {
              targetUser = await databaseService.users.findOne(
                { _id: target.sender_id },
                { projection: { username: 1, avatar: 1 } }
              )
            }
            break
          case LikeTargetTypes.User:
            targetUser = await databaseService.users.findOne(
              { _id: new ObjectId(like.target_id) },
              { projection: { username: 1, avatar: 1 } }
            )
            target = targetUser
            break
        }

        return {
          ...like,
          target,
          target_user: targetUser
        }
      })
    )

    const total = await databaseService.likes.countDocuments({ user_id: new ObjectId(user_id) })

    return { likes: likesWithTargetInfo, total }
  }

  async checkLikeStatus(user_id: string, target_id: string, target_type: string): Promise<boolean> {
    const like = await databaseService.likes.findOne({
      user_id: new ObjectId(user_id),
      target_id,
      target_type
    })

    return !!like
  }

  async getLikeCount(target_id: string, target_type: string): Promise<number> {
    return await databaseService.likes.countDocuments({ target_id, target_type })
  }

  private async verifyTargetExists(target_id: string, target_type: LikeTargetTypes) {
    let exists = false

    switch (target_type) {
      case LikeTargetTypes.Story: {
        const story = await databaseService.stories.findOne({ _id: new ObjectId(target_id) })
        exists = !!story
        break
      }
      case LikeTargetTypes.Message: {
        const message = await databaseService.messages.findOne({ _id: new ObjectId(target_id) })
        exists = !!message
        break
      }
      case LikeTargetTypes.User: {
        const user = await databaseService.users.findOne({ _id: new ObjectId(target_id) })
        exists = !!user
        break
      }
    }

    if (!exists) {
      throw new ErrorWithStatus({
        messages: LIKES_MESSAGES.TARGET_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
  }
}

const likesServices = new LikesServices()
export default likesServices
