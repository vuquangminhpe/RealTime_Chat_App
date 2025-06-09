import express from 'express'
import { setupSwagger } from './swagger-config'

// Import all Swagger documentation files to ensure they're included
import './users'
import './friendShip'
import './messagesAndConversation'
import './storiesAndReactionAndLike'
import './groupChatAndConversation'
import './medias'
import './bannedUser'
import './socketDocs'

/**
 * Setup Swagger documentation for the Realtime Chat API
 * This creates a route at /api-docs that serves the Swagger UI
 * @param app Express application instance
 */
export const setupSwaggerDocs = (app: express.Express) => {
  // Setup Swagger UI at /api-docs
  setupSwagger(app)

  // Add a redirect from root to Swagger docs for development
  app.get('/', (req, res) => {
    res.redirect('/api-docs')
  })

  // Add API info endpoint
  app.get('/api', (req, res) => {
    res.json({
      name: 'Realtime Chat API',
      version: '1.0.0',
      description: 'API for realtime chat application with Socket.IO',
      documentation: '/api-docs',
      endpoints: {
        users: '/api/v1/users',
        friends: '/api/v1/friend-requests',
        conversations: '/api/v1/conversations',
        messages: '/api/v1/messages',
        stories: '/api/v1/stories',
        reactions: '/api/v1/reactions',
        likes: '/api/v1/likes',
        groups: '/api/v1/groups',
        notifications: '/api/v1/notifications',
        media: '/api/v1/medias',
        ban_users: '/api/v1/ban-users',
        socket: '/socket.io'
      },
      features: [
        'Real-time messaging with Socket.IO',
        'User authentication and authorization',
        'Friend system with requests',
        'Group chat with role management',
        'Stories with 24-hour expiration',
        'Reactions and likes system',
        'Media upload (images, videos, HLS streaming)',
        'Push notifications',
        'User ban/unban system',
        'Message read status and typing indicators',
        'Online/offline status tracking'
      ]
    })
  })

  console.log('📚 Swagger documentation available at /api-docs')
  console.log('ℹ️  API information available at /api')
}
