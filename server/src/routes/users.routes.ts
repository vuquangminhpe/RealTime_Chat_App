import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'

export const usersRouter = Router()

/**
 * Description: login
 * Path: /login
 * method: POST
 * Header: {access_token: string, refresh_token: string}
 * body: {email: string, password: string}
 */

usersRouter.post('/login', loginValidator, wrapAsync(loginController))
