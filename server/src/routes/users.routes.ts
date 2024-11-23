import { Router } from 'express'
import { loginController, registerController } from '~/controllers/user.controllers'
import { loginValidator, registerValidator } from '~/middlewares/User.middlewares'
import { wrapAsync } from '~/utils/handler'

export const usersRouter = Router()

/**
 * Description: register
 * Path: /register
 * method: POST
 * body: {email: string, password: string}
 */

usersRouter.post('/register', registerValidator, wrapAsync(registerController))

/**
 * Description: login
 * Path: /login
 * method: POST
 * body: {email: string, password: string}
 */

usersRouter.post('/login', loginValidator, wrapAsync(loginController))
