import { Express } from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { isProduction } from '../constants/config'
import path from 'path'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Realtime Chat API',
      version: '1.0.0',
      description: 'API documentation for Realtime Chat Application with Socket.IO',
      contact: {
        name: 'API Support',
        email: 'support@chatapp.com'
      }
    },
    servers: [
      {
        url: 'https://your-production-domain.com',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            password: {
              type: 'string',
              description: 'User password'
            },
            date_of_birth: {
              type: 'string',
              format: 'date',
              description: 'Date of birth'
            },
            avatar: {
              type: 'string',
              description: 'Avatar URL'
            },
            bio: {
              type: 'string',
              description: 'User bio'
            },
            location: {
              type: 'string',
              description: 'Location'
            },
            website: {
              type: 'string',
              description: 'Website URL'
            },
            verify: {
              type: 'integer',
              enum: [0, 1, 2],
              description: 'Verification status: 0=unverified, 1=verified, 2=banned'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },

        Conversation: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Conversation ID'
            },
            sender_id: {
              type: 'string',
              description: 'Conversation creator ID'
            },
            receiver_id: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Participant IDs'
            },
            type: {
              type: 'string',
              enum: ['private', 'group'],
              description: 'Conversation type'
            },
            content: {
              type: 'string',
              description: 'Last message content'
            },
            group_name: {
              type: 'string',
              description: 'Group name (for group chats)'
            },
            group_description: {
              type: 'string',
              description: 'Group description (for group chats)'
            },
            group_avatar: {
              type: 'string',
              description: 'Group avatar URL (for group chats)'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            update_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },

        Message: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Message ID'
            },
            conversation_id: {
              type: 'string',
              description: 'Conversation ID'
            },
            sender_id: {
              type: 'string',
              description: 'Sender ID'
            },
            content: {
              type: 'string',
              description: 'Message content'
            },
            message_type: {
              type: 'string',
              enum: ['text', 'image', 'video', 'file', 'audio'],
              description: 'Message type'
            },
            medias: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Media'
              },
              description: 'Media attachments'
            },
            reply_to: {
              type: 'string',
              description: 'ID of message being replied to'
            },
            edited: {
              type: 'boolean',
              description: 'Whether message was edited'
            },
            edited_at: {
              type: 'string',
              format: 'date-time',
              description: 'Edit timestamp'
            },
            status: {
              type: 'string',
              enum: ['sent', 'delivered', 'read'],
              description: 'Message status'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },

        Story: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Story ID'
            },
            user_id: {
              type: 'string',
              description: 'User ID'
            },
            content: {
              type: 'string',
              enum: ['Image', 'Videos'],
              description: 'Story content type'
            },
            media: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Media'
              },
              description: 'Story media'
            },
            text: {
              type: 'string',
              description: 'Story text content'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            expire_at: {
              type: 'string',
              format: 'date-time',
              description: 'Expiration timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },

        FriendShip: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Friendship ID'
            },
            user_id: {
              type: 'string',
              description: 'User ID'
            },
            friend_id: {
              type: 'string',
              description: 'Friend ID'
            },
            status: {
              type: 'string',
              enum: ['accepted', 'pending', 'blocked', 'rejected'],
              description: 'Friendship status'
            },
            activeStatus: {
              type: 'string',
              enum: ['online', 'offline'],
              description: 'User activity status'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            }
          }
        },

        Reaction: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Reaction ID'
            },
            user_reactions_id: {
              type: 'string',
              description: 'User ID who reacted'
            },
            story_id: {
              type: 'string',
              description: 'Target ID (story, message, etc.)'
            },
            reaction_type: {
              type: 'string',
              enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
              description: 'Reaction type'
            },
            reacted_at: {
              type: 'string',
              format: 'date-time',
              description: 'Reaction timestamp'
            }
          }
        },

        Like: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Like ID'
            },
            user_id: {
              type: 'string',
              description: 'User ID'
            },
            target_id: {
              type: 'string',
              description: 'Target ID'
            },
            target_type: {
              type: 'string',
              enum: ['story', 'message', 'user'],
              description: 'Target type'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            }
          }
        },

        Notification: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Notification ID'
            },
            recipient_id: {
              type: 'string',
              description: 'Recipient ID'
            },
            sender_id: {
              type: 'string',
              description: 'Sender ID'
            },
            type: {
              type: 'string',
              enum: [
                'friend_request',
                'friend_accepted',
                'message_received',
                'mention',
                'like',
                'reaction',
                'group_invite',
                'group_member_added',
                'group_role_changed',
                'story_reaction'
              ],
              description: 'Notification type'
            },
            title: {
              type: 'string',
              description: 'Notification title'
            },
            message: {
              type: 'string',
              description: 'Notification message'
            },
            data: {
              type: 'object',
              description: 'Additional notification data'
            },
            target_id: {
              type: 'string',
              description: 'Target ID'
            },
            target_type: {
              type: 'string',
              description: 'Target type'
            },
            status: {
              type: 'string',
              enum: ['unread', 'read'],
              description: 'Read status'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            read_at: {
              type: 'string',
              format: 'date-time',
              description: 'Read timestamp'
            }
          }
        },

        GroupMember: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Group member ID'
            },
            group_id: {
              type: 'string',
              description: 'Group ID'
            },
            user_id: {
              type: 'string',
              description: 'User ID'
            },
            role: {
              type: 'string',
              enum: ['owner', 'admin', 'member'],
              description: 'Member role'
            },
            status: {
              type: 'string',
              enum: ['active', 'left', 'removed'],
              description: 'Member status'
            },
            joined_at: {
              type: 'string',
              format: 'date-time',
              description: 'Join timestamp'
            },
            left_at: {
              type: 'string',
              format: 'date-time',
              description: 'Leave timestamp'
            },
            added_by: {
              type: 'string',
              description: 'ID of user who added this member'
            }
          }
        },

        Media: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'Media URL'
            },
            type: {
              type: 'string',
              enum: ['Image', 'Video', 'HLS'],
              description: 'Media type'
            }
          }
        },

        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            errorInfo: {
              type: 'object',
              description: 'Additional error information'
            },
            errors: {
              type: 'object',
              description: 'Validation errors'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                message: 'Unauthorized',
                errorInfo: {
                  name: 'JsonWebTokenError',
                  message: 'Invalid token'
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                message: 'Validation error',
                errors: {
                  username: {
                    msg: 'Username is required',
                    path: 'username',
                    location: 'body'
                  }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                message: 'Resource not found'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                message: 'Internal server error'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    paths: {}
  },
  apis: isProduction ? [path.join(__dirname, '/*.js')] : ['./src/Swagger/*.ts']
}

const specs = swaggerJsdoc(options)

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }))
}
