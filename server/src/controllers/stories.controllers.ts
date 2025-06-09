import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { AddStoryReqBody, GetStoriesReqBody } from '~/models/request/Stories.requests'
import { TokenPayload } from '~/models/request/User.request'
import storiesServices from '~/services/stories.services'
import { STORIES_MESSAGES } from '~/constants/messages'

export const addStoryController = async (
  req: Request<ParamsDictionary, any, AddStoryReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await storiesServices.addStory(user_id, req.body)
  res.json({
    message: STORIES_MESSAGES.ADD_STORY_SUCCESS,
    result
  })
}

export const getStoriesController = async (
  req: Request<ParamsDictionary, any, GetStoriesReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { limit, page } = req.query
  const stories = await storiesServices.getStories(user_id, Number(limit), Number(page))
  res.json({
    message: STORIES_MESSAGES.GET_STORIES_SUCCESS,
    result: stories.stories,
    page: Number(page),
    total_pages: Math.ceil(stories.total / Number(limit))
  })
}

export const deleteStoryController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { story_id } = req.params
  const { user_id } = req.decode_authorization as TokenPayload
  await storiesServices.deleteStory(story_id, user_id)
  res.json({
    message: STORIES_MESSAGES.DELETE_STORY_SUCCESS
  })
}

export const getUserStoriesController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { username } = req.params
  const { limit, page } = req.query
  const stories = await storiesServices.getUserStories(username, Number(limit), Number(page))
  res.json({
    message: STORIES_MESSAGES.GET_USER_STORIES_SUCCESS,
    result: stories.stories,
    page: Number(page),
    total_pages: Math.ceil(stories.total / Number(limit))
  })
}
