import { Router } from 'express'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

export const stories = Router()

/**
 * Description: Add to news
 * Path: /add_to_news
 * method: post
 * headers: {access_token:string}
 * body: {image: string}
 */

stories.post('/add_to_news', accessTokenValidator, wrapAsync(addToNewsController))
