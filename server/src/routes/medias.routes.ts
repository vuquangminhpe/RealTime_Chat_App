import { Router } from 'express'
import {
  uploadImageController,
  uploadVideoController,
  uploadVideoHLSController,
  videoStatusController
} from '~/controllers/medias.controllers'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'
const mediasRouter = Router()

mediasRouter.post('/upload-image', accessTokenValidator, verifyUserValidator, wrapAsync(uploadImageController))
mediasRouter.post('/upload-video', accessTokenValidator, verifyUserValidator, wrapAsync(uploadVideoController))
mediasRouter.post('/upload-video-hls', accessTokenValidator, verifyUserValidator, wrapAsync(uploadVideoHLSController))
mediasRouter.get('/video-status/:id', accessTokenValidator, verifyUserValidator, wrapAsync(videoStatusController))

export default mediasRouter
