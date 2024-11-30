import express from 'express'
import { envConfig, isProduction } from './constants/config'
import { createServer } from 'http'
import { usersRouter } from './routes/users.routes'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { banUsersRouter } from './routes/banUsers.routes'
import { initFolderImage, initFolderVideo, initFolderVideoHls } from './utils/file'
import staticRouter from './routes/static.routes'
import mediasRouter from './routes/medias.routes'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import cors, { CorsOptions } from 'cors'
import initSocket from './utils/socket'
import { friendShipsRouter } from './routes/friendsShip.routes'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15p
  max: 100, // 1 IP => 100 requests 15 phút
  standardHeaders: true,
  legacyHeaders: false
})
const app = express()
app.use(express.json())
const port = envConfig.port || 3000
app.use(helmet())
const corsOptions: CorsOptions = {
  origin: isProduction ? envConfig.client_url : '*'
}

app.use(limiter)
app.use(cors(corsOptions))
initFolderImage()
initFolderVideo()
initFolderVideoHls()
const httpServer = createServer(app)
app.use('/users', usersRouter)
app.use('/friend-requests', friendShipsRouter)
app.use('/ban_users', banUsersRouter)
app.use('/static', staticRouter)
app.use('/medias', mediasRouter)
app.use('/static/video-stream', express.static(UPLOAD_VIDEO_DIR))

app.use(defaultErrorHandler)
initSocket(httpServer)
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
