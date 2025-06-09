import { StoriesDataType } from '~/constants/enum'
import { Media } from '~/models/Other'

export interface AddStoryReqBody {
  content: StoriesDataType
  media?: Media[]
  text?: string
}

export interface GetStoriesReqBody {
  limit?: number
  page?: number
}

export interface DeleteStoryReqBody {
  story_id: string
}
