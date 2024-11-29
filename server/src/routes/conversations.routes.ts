import { Router } from 'express'
import { getConversationsController } from '~/controllers/conversations.controllers'
import { paginationValidator } from '~/middlewares/supports.middlewares'
import { accessTokenValidator, getConversationsValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

const conversationsRouter = Router()

conversationsRouter.get(
  '/receivers',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  getConversationsValidator,
  wrapAsync(getConversationsController)
)
