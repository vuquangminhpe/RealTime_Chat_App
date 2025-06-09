import { Router } from 'express'
import {
  addStoryController,
  getStoriesController,
  deleteStoryController,
  getUserStoriesController
} from '~/controllers/stories.controllers'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { addStoryValidator, deleteStoryValidator } from '~/middlewares/stories.middlewares'
import { paginationValidator } from '~/middlewares/supports.middlewares'
import { wrapAsync } from '~/utils/handler'

export const storiesRouter = Router()

/**
 * Description: Add story
 * Path: /add
 * method: POST
 * headers: {access_token: string}
 * body: AddStoryReqBody
 */
storiesRouter.post('/add', accessTokenValidator, verifyUserValidator, addStoryValidator, wrapAsync(addStoryController))

/**
 * Description: Get stories from friends and self
 * Path: /
 * method: GET
 * headers: {access_token: string}
 * query: {limit: number, page: number}
 */
storiesRouter.get('/', accessTokenValidator, verifyUserValidator, paginationValidator, wrapAsync(getStoriesController))

/**
 * Description: Delete story
 * Path: /:story_id
 * method: DELETE
 * headers: {access_token: string}
 * params: {story_id: string}
 */
storiesRouter.delete(
  '/:story_id',
  accessTokenValidator,
  verifyUserValidator,
  deleteStoryValidator,
  wrapAsync(deleteStoryController)
)

/**
 * Description: Get user stories by username
 * Path: /user/:username
 * method: GET
 * headers: {access_token: string}
 * params: {username: string}
 * query: {limit: number, page: number}
 */
storiesRouter.get(
  '/user/:username',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  wrapAsync(getUserStoriesController)
)
