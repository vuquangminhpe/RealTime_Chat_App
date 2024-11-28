import { StoriesDataType } from '~/constants/enum'

export interface StoriesType {
  _id: string
  user_id: string
  content: StoriesDataType
  created_at?: Date
  expire_at?: Date
  updated_at?: Date
}

class Stories {
  _id: string
  user_id: string
  content: StoriesDataType
  created_at?: Date
  expire_at?: Date
  updated_at?: Date

  constructor({ _id, user_id, content, created_at, expire_at, updated_at }: StoriesType) {
    this._id = _id
    this.user_id = user_id
    this.content = content
    this.created_at = created_at || new Date()
    this.expire_at = expire_at
    this.updated_at = updated_at
  }
}

export default Stories
