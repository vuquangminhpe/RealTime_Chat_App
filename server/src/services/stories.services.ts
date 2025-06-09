import { ObjectId } from 'mongodb'
import Stories from '~/models/schemas/stories.schema'
import databaseService from './database.services'
import { ErrorWithStatus } from '~/models/Errors'
import { STORIES_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { AddStoryReqBody } from '~/models/request/Story.request'

class StoriesServices {
  async addStory(user_id: string, body: AddStoryReqBody) {
    const _id = new ObjectId()
    const expireDate = new Date()
    expireDate.setHours(expireDate.getHours() + 24) // Stories expire after 24 hours

    const story = await databaseService.stories.insertOne(
      new Stories({
        _id,
        user_id,
        content: body.content,
        expire_at: expireDate
      })
    )

    const result = await databaseService.stories.findOne({ _id: new ObjectId(story.insertedId) })
    return result
  }

  async getStories(user_id: string, limit: number, page: number) {
    // Get stories from friends and own stories
    const friends = await databaseService.friendShip.find({ user_id: new ObjectId(user_id) }).toArray()

    const friendIds = friends.map((friend) => friend.friend_id.toString())
    friendIds.push(user_id) // Include own stories

    const currentTime = new Date()

    const stories = await databaseService.stories
      .find({
        user_id: { $in: friendIds },
        expire_at: { $gt: currentTime } // Only get non-expired stories
      })
      .sort({ created_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    // Get user info for each story
    const storiesWithUserInfo = await Promise.all(
      stories.map(async (story) => {
        const user = await databaseService.users.findOne(
          { _id: new ObjectId(story.user_id) },
          { projection: { username: 1, avatar: 1 } }
        )
        return {
          ...story,
          user
        }
      })
    )

    const total = await databaseService.stories.countDocuments({
      user_id: { $in: friendIds },
      expire_at: { $gt: currentTime }
    })

    return { stories: storiesWithUserInfo, total }
  }

  async deleteStory(story_id: string, user_id: string) {
    const story = await databaseService.stories.findOne({ _id: new ObjectId(story_id) })

    if (!story) {
      throw new ErrorWithStatus({
        messages: STORIES_MESSAGES.STORY_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (story.user_id !== user_id) {
      throw new ErrorWithStatus({
        messages: STORIES_MESSAGES.NOT_YOUR_STORY,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    await databaseService.stories.deleteOne({ _id: new ObjectId(story_id) })
  }

  async getUserStories(username: string, limit: number, page: number) {
    const user = await databaseService.users.findOne({ username })

    if (!user) {
      throw new ErrorWithStatus({
        messages: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const currentTime = new Date()

    const stories = await databaseService.stories
      .find({
        user_id: user._id.toString(),
        expire_at: { $gt: currentTime }
      })
      .sort({ created_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    const storiesWithUserInfo = stories.map((story) => ({
      ...story,
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar
      }
    }))

    const total = await databaseService.stories.countDocuments({
      user_id: user._id.toString(),
      expire_at: { $gt: currentTime }
    })

    return { stories: storiesWithUserInfo, total }
  }

  // Auto cleanup expired stories
  async cleanupExpiredStories() {
    const currentTime = new Date()
    await databaseService.stories.deleteMany({
      expire_at: { $lt: currentTime }
    })
  }
}

const storiesServices = new StoriesServices()
export default storiesServices
