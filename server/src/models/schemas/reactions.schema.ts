import { ObjectId } from 'mongodb'
import { ReactionStatus } from '~/constants/enum'

export interface reactionsType {
  _id: ObjectId
  user_reactions_id: string
  story_id: string
  reaction_type: ReactionStatus
  reacted_at?: Date
}

class Reactions {
  _id: ObjectId
  user_reactions_id: string
  story_id: string
  reaction_type: ReactionStatus
  reacted_at?: Date

  constructor({ _id, user_reactions_id, story_id, reaction_type, reacted_at }: reactionsType) {
    this._id = _id
    this.user_reactions_id = user_reactions_id
    this.story_id = story_id
    this.reaction_type = reaction_type
    this.reacted_at = reacted_at || new Date()
  }
}

export default Reactions
