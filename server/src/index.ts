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
import { storiesRouter } from './routes/stories.routes'
import { reactionsRouter } from './routes/reactions.routes'
import { messagesRouter } from './routes/messages.routes'
import conversationsRouter from './routes/conversations.routes'
import { likesRouter } from './routes/likes.routes'
import { notificationsRouter } from './routes/notifications.routes'
import { groupChatRouter } from './routes/groupChat.routes'
import databaseService from './services/database.services'
import storiesServices from './services/stories.services'
import { setupSwaggerDocs } from './Swagger/setupSwaggerDocs'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
})

const app = express()

// Middleware setup
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const port = envConfig.port || 3000

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:']
      }
    }
  })
)

app.use(limiter)

initFolderImage()
initFolderVideo()
initFolderVideoHls()

// Connect to database
databaseService.connect()

setupSwaggerDocs(app)

// Create HTTP server
const httpServer = createServer(app)

const API_PREFIX = '/api/v1'

app.use(`${API_PREFIX}/users`, usersRouter)
app.use(`${API_PREFIX}/friend-requests`, friendShipsRouter)
app.use(`${API_PREFIX}/ban-users`, banUsersRouter)
app.use(`${API_PREFIX}/conversations`, conversationsRouter)
app.use(`${API_PREFIX}/messages`, messagesRouter)
app.use(`${API_PREFIX}/stories`, storiesRouter)
app.use(`${API_PREFIX}/reactions`, reactionsRouter)
app.use(`${API_PREFIX}/likes`, likesRouter)
app.use(`${API_PREFIX}/notifications`, notificationsRouter)
app.use(`${API_PREFIX}/groups`, groupChatRouter)
app.use(`${API_PREFIX}/medias`, mediasRouter)

// Static file serving
app.use('/static', staticRouter)
app.use('/static/video-stream', express.static(UPLOAD_VIDEO_DIR))

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    suggestion: 'Check /api for available endpoints or /api-docs for documentation'
  })
})

app.use(defaultErrorHandler)

const io = initSocket(httpServer)

const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received, shutting down gracefully`)

  httpServer.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err)
      process.exit(1)
    }

    console.log('HTTP server closed')

    console.log('Process terminated')
    process.exit(0)
  })

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  gracefulShutdown('uncaughtException')
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  gracefulShutdown('unhandledRejection')
})

// Start server
httpServer.listen(port, () => {
  console.log(` Server running on: http://localhost:${port}`)
  console.log(` API Documentation: http://localhost:${port}/api-docs`)
})

setInterval(
  async () => {
    try {
      await storiesServices.cleanupExpiredStories()
      console.log(' Cleaned up expired stories')
    } catch (error) {
      console.error(' Error cleaning up expired stories:', error)
    }
  },
  60 * 60 * 1000
)

export { app, httpServer, io }
