import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/request/User.request'
import notificationsServices from '~/services/notifications.services'
import { NOTIFICATIONS_MESSAGES } from '~/constants/messages'

export const getNotificationsController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { limit, page, status } = req.query

  const notifications = await notificationsServices.getNotifications(
    user_id,
    Number(limit),
    Number(page),
    status as string
  )

  res.json({
    message: NOTIFICATIONS_MESSAGES.GET_NOTIFICATIONS_SUCCESS,
    result: notifications.notifications,
    page: Number(page),
    total_pages: Math.ceil(notifications.total / Number(limit)),
    unread_count: notifications.unread_count
  })
}

export const markNotificationReadController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { notification_id } = req.params

  await notificationsServices.markNotificationRead(user_id, notification_id)

  res.json({
    message: NOTIFICATIONS_MESSAGES.MARK_READ_SUCCESS
  })
}

export const markAllReadController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload

  const result = await notificationsServices.markAllRead(user_id)

  res.json({
    message: NOTIFICATIONS_MESSAGES.MARK_ALL_READ_SUCCESS,
    result: { marked_count: result.modifiedCount }
  })
}

export const deleteNotificationController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { notification_id } = req.params

  await notificationsServices.deleteNotification(user_id, notification_id)

  res.json({
    message: NOTIFICATIONS_MESSAGES.DELETE_NOTIFICATION_SUCCESS
  })
}

export const getUnreadCountController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload

  const count = await notificationsServices.getUnreadCount(user_id)

  res.json({
    message: NOTIFICATIONS_MESSAGES.GET_UNREAD_COUNT_SUCCESS,
    result: { unread_count: count }
  })
}

export const clearAllNotificationsController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload

  const result = await notificationsServices.clearAllNotifications(user_id)

  res.json({
    message: NOTIFICATIONS_MESSAGES.CLEAR_ALL_SUCCESS,
    result: { deleted_count: result.deletedCount }
  })
}
