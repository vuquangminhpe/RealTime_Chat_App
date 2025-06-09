import { Router } from 'express'
import {
  getNotificationsController,
  markNotificationReadController,
  markAllReadController,
  deleteNotificationController,
  getUnreadCountController,
  clearAllNotificationsController
} from '~/controllers/notifications.controllers'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { markNotificationReadValidator, deleteNotificationValidator } from '~/middlewares/notifications.middlewares'
import { paginationValidator } from '~/middlewares/supports.middlewares'
import { wrapAsync } from '~/utils/handler'

export const notificationsRouter = Router()

/**
 * Description: Get user notifications
 * Path: /
 * method: GET
 * headers: {access_token: string}
 * query: {limit: number, page: number, status?: string}
 */
notificationsRouter.get(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  wrapAsync(getNotificationsController)
)

/**
 * Description: Mark notification as read
 * Path: /:notification_id/read
 * method: PUT
 * headers: {access_token: string}
 * params: {notification_id: string}
 */
notificationsRouter.put(
  '/:notification_id/read',
  accessTokenValidator,
  verifyUserValidator,
  markNotificationReadValidator,
  wrapAsync(markNotificationReadController)
)

/**
 * Description: Mark all notifications as read
 * Path: /mark-all-read
 * method: PUT
 * headers: {access_token: string}
 */
notificationsRouter.put('/mark-all-read', accessTokenValidator, verifyUserValidator, wrapAsync(markAllReadController))

/**
 * Description: Delete notification
 * Path: /:notification_id
 * method: DELETE
 * headers: {access_token: string}
 * params: {notification_id: string}
 */
notificationsRouter.delete(
  '/:notification_id',
  accessTokenValidator,
  verifyUserValidator,
  deleteNotificationValidator,
  wrapAsync(deleteNotificationController)
)

/**
 * Description: Get unread notifications count
 * Path: /unread-count
 * method: GET
 * headers: {access_token: string}
 */
notificationsRouter.get('/unread-count', accessTokenValidator, verifyUserValidator, wrapAsync(getUnreadCountController))

/**
 * Description: Clear all notifications
 * Path: /clear-all
 * method: DELETE
 * headers: {access_token: string}
 */
notificationsRouter.delete(
  '/clear-all',
  accessTokenValidator,
  verifyUserValidator,
  wrapAsync(clearAllNotificationsController)
)
