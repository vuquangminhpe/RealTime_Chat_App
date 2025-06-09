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
import { likesRouter } from './routes/likes.routes'
import { notificationsRouter } from './routes/notifications.routes'
import databaseService from './services/database.services'
import { setupSwaggerDocs } from './Swagger/socketDocs'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
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

// CORS configuration
const corsOptions: CorsOptions = {
  origin: isProduction
    ? envConfig.client_url
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(limiter)

// Initialize upload folders
initFolderImage()
initFolderVideo()
initFolderVideoHls()

// Connect to database
databaseService.connect()

// Setup Swagger Documentation (before routes)
setupSwaggerDocs(app)

// Create HTTP server
const httpServer = createServer(app)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: isProduction ? 'production' : 'development',
    version: '1.0.0'
  })
})

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

// API route listing
app.get('/api', (req, res) => {
  res.json({
    name: 'Realtime Chat API',
    version: '1.0.0',
    description: 'API for realtime chat application with Socket.IO',
    documentation: '/api-docs',
    base_url: `${req.protocol}://${req.get('host')}${API_PREFIX}`,
    endpoints: {
      auth: {
        register: `POST ${API_PREFIX}/users/register`,
        login: `POST ${API_PREFIX}/users/login`,
        logout: `POST ${API_PREFIX}/users/logout`,
        refresh: `POST ${API_PREFIX}/users/refresh-token`
      },
      users: {
        profile: `GET ${API_PREFIX}/users/me`,
        updateProfile: `PUT ${API_PREFIX}/users/me`,
        getUserByUsername: `GET ${API_PREFIX}/users/:username`
      },
      friends: {
        sendRequest: `POST ${API_PREFIX}/friend-requests/add`,
        acceptRequest: `POST ${API_PREFIX}/friend-requests/accept/:friend_id`,
        rejectRequest: `DELETE ${API_PREFIX}/friend-requests/reject/:friend_id`,
        getAllFriends: `GET ${API_PREFIX}/friend-requests/all-friends`,
        searchFriends: `GET ${API_PREFIX}/friend-requests/search-friends`
      },
      conversations: {
        getAll: `GET ${API_PREFIX}/conversations/get_all_conversations`,
        getSpecific: `GET ${API_PREFIX}/conversations/receivers`
      },
      messages: {
        send: `POST ${API_PREFIX}/messages/send`,
        getMessages: `GET ${API_PREFIX}/messages`,
        editMessage: `PUT ${API_PREFIX}/messages/:message_id`,
        deleteMessage: `DELETE ${API_PREFIX}/messages/:message_id`,
        markRead: `POST ${API_PREFIX}/messages/mark-read`,
        search: `GET ${API_PREFIX}/messages/search`
      },
      stories: {
        add: `POST ${API_PREFIX}/stories/add`,
        getAll: `GET ${API_PREFIX}/stories`,
        delete: `DELETE ${API_PREFIX}/stories/:story_id`,
        getUserStories: `GET ${API_PREFIX}/stories/user/:username`
      },
      reactions: {
        add: `POST ${API_PREFIX}/reactions/add`,
        remove: `DELETE ${API_PREFIX}/reactions/remove`,
        get: `GET ${API_PREFIX}/reactions`,
        getUserReactions: `GET ${API_PREFIX}/reactions/user`
      },
      likes: {
        like: `POST ${API_PREFIX}/likes/like`,
        unlike: `DELETE ${API_PREFIX}/likes/unlike`,
        getLikes: `GET ${API_PREFIX}/likes`,
        checkStatus: `GET ${API_PREFIX}/likes/status`
      },
      groups: {
        create: `POST ${API_PREFIX}/groups/create`,
        addMember: `POST ${API_PREFIX}/groups/:group_id/add-member`,
        removeMember: `DELETE ${API_PREFIX}/groups/:group_id/remove-member`,
        leave: `POST ${API_PREFIX}/groups/:group_id/leave`,
        update: `PUT ${API_PREFIX}/groups/:group_id`,
        getInfo: `GET ${API_PREFIX}/groups/:group_id`,
        getMembers: `GET ${API_PREFIX}/groups/:group_id/members`,
        getUserGroups: `GET ${API_PREFIX}/groups/user`
      },
      notifications: {
        getAll: `GET ${API_PREFIX}/notifications`,
        markRead: `PUT ${API_PREFIX}/notifications/:notification_id/read`,
        markAllRead: `PUT ${API_PREFIX}/notifications/mark-all-read`,
        delete: `DELETE ${API_PREFIX}/notifications/:notification_id`,
        getUnreadCount: `GET ${API_PREFIX}/notifications/unread-count`,
        clearAll: `DELETE ${API_PREFIX}/notifications/clear-all`
      },
      media: {
        uploadImage: `POST ${API_PREFIX}/medias/upload-image`,
        uploadVideo: `POST ${API_PREFIX}/medias/upload-video`,
        uploadVideoHLS: `POST ${API_PREFIX}/medias/upload-video-hls`,
        getVideoStatus: `GET ${API_PREFIX}/medias/video-status/:id`
      },
      admin: {
        banUser: `POST ${API_PREFIX}/ban-users/:user_id`,
        unbanUser: `DELETE ${API_PREFIX}/ban-users/:user_id`
      }
    },
    socketIO: {
      endpoint: '/socket.io',
      events: {
        client_events: [
          'send-message',
          'mark-message-read',
          'typing-start',
          'typing-stop',
          'join-conversation',
          'leave-conversation',
          'add-reaction',
          'status-change'
        ],
        server_events: [
          'message-sent',
          'receive-message',
          'messages-read',
          'user-typing',
          'reaction-added',
          'friend-status-change',
          'error'
        ]
      }
    }
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    suggestion: 'Check /api for available endpoints or /api-docs for documentation'
  })
})

// Global error handler
app.use(defaultErrorHandler)

// Initialize Socket.IO
const io = initSocket(httpServer)

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received, shutting down gracefully`)

  httpServer.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err)
      process.exit(1)
    }

    console.log('HTTP server closed')

    // Close database connection
    // databaseService.close() // Add this method if needed

    console.log('Process terminated')
    process.exit(0)
  })

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions
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
  console.log('🚀 ===================================')
  console.log(`📱 Realtime Chat API Server Started`)
  console.log(`🌍 Environment: ${isProduction ? 'production' : 'development'}`)
  console.log(`🔗 Server running on: http://localhost:${port}`)
  console.log(`📊 API Base URL: http://localhost:${port}${API_PREFIX}`)
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`)
  console.log(`ℹ️  API Info: http://localhost:${port}/api`)
  console.log(`📡 Socket.IO: http://localhost:${port}/socket.io`)
  console.log(`💾 Database: ${databaseService ? 'Connected' : 'Disconnected'}`)
  console.log('🚀 ===================================')
})

// Background tasks
setInterval(
  async () => {
    try {
      // Cleanup expired stories every hour
      const { default: storiesServices } = await import('./services/stories.services')
      await storiesServices.cleanupExpiredStories()
      console.log('✅ Cleaned up expired stories')
    } catch (error) {
      console.error('❌ Error cleaning up expired stories:', error)
    }
  },
  60 * 60 * 1000
) // 1 hour

// Export for testing or external use
export { app, httpServer, io }
