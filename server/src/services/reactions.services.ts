import { ObjectId } from 'mongodb'
import { ReactionStatus } from '~/constants/enum'
import { AddReactionReqBody } from '~/models/request/Reactions.requests'
import Reactions from '~/models/schemas/reactions.schema'
import databaseService from './database.services'
import { ErrorWithStatus } from '~/models/Errors'
import { REACTIONS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'

class ReactionsServices {
  async addReaction(user_id: string, body: AddReactionReqBody) {
    const { target_id, reaction_type } = body

    // Check if user already reacted to this target
    const existingReaction = await databaseService.reactions.findOne({
      user_reactions_id: user_id,
      story_id: target_id // Using story_id as generic target_id field
    })

    if (existingReaction) {
      // Update existing reaction
      const result = await databaseService.reactions.findOneAndUpdate(
        {
          user_reactions_id: user_id,
          story_id: target_id
        },
        {
          $set: {
            reaction_type,
            reacted_at: new Date()
          }
        },
        { returnDocument: 'after' }
      )
      return result
    } else {
      // Create new reaction
      const _id = new ObjectId()
      const reaction = await databaseService.reactions.insertOne(
        new Reactions({
          _id,
          user_reactions_id: user_id,
          story_id: target_id,
          reaction_type
        })
      )

      const result = await databaseService.reactions.findOne({ _id: new ObjectId(reaction.insertedId) })
      return result
    }
  }

  async removeReaction(user_id: string, target_id: string, target_type: string) {
    const reaction = await databaseService.reactions.findOne({
      user_reactions_id: user_id,
      story_id: target_id
    })

    if (!reaction) {
      throw new ErrorWithStatus({
        messages: REACTIONS_MESSAGES.REACTION_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    await databaseService.reactions.deleteOne({
      user_reactions_id: user_id,
      story_id: target_id
    })
  }

  async getReactions(target_id: string, target_type: string, limit: number, page: number) {
    const reactions = await databaseService.reactions
      .find({ story_id: target_id })
      .sort({ reacted_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    // Get user info for each reaction
    const reactionsWithUserInfo = await Promise.all(
      reactions.map(async (reaction) => {
        const user = await databaseService.users.findOne(
          { _id: new ObjectId(reaction.user_reactions_id) },
          { projection: { username: 1, avatar: 1 } }
        )
        return {
          ...reaction,
          user
        }
      })
    )

    // Get reaction summary
    const summary = await this.getReactionSummary(target_id)

    const total = await databaseService.reactions.countDocuments({ story_id: target_id })

    return { reactions: reactionsWithUserInfo, total, summary }
  }

  async getReactionSummary(target_id: string) {
    const pipeline = [
      { $match: { story_id: target_id } },
      {
        $group: {
          _id: '$reaction_type',
          count: { $sum: 1 }
        }
      }
    ]

    const summary = await databaseService.reactions.aggregate(pipeline).toArray()

    // Convert to object format
    const summaryObject: { [key: string]: number } = {}
    summary.forEach((item) => {
      summaryObject[ReactionStatus[item._id]] = item.count
    })

    return summaryObject
  }

  async getUserReactions(user_id: string, limit: number, page: number) {
    const reactions = await databaseService.reactions
      .find({ user_reactions_id: user_id })
      .sort({ reacted_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    // Get target info for each reaction (could be story, message, etc.)
    const reactionsWithTargetInfo = await Promise.all(
      reactions.map(async (reaction) => {
        // For now, assuming target is story
        const story = await databaseService.stories.findOne({ _id: new ObjectId(reaction.story_id) })
        let targetUser = null

        if (story) {
          targetUser = await databaseService.users.findOne(
            { _id: new ObjectId(story.user_id) },
            { projection: { username: 1, avatar: 1 } }
          )
        }

        return {
          ...reaction,
          target: story,
          target_user: targetUser
        }
      })
    )

    const total = await databaseService.reactions.countDocuments({ user_reactions_id: user_id })

    return { reactions: reactionsWithTargetInfo, total }
  }
}

const reactionsServices = new ReactionsServices()
export default reactionsServices
