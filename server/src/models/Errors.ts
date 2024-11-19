import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'

type ErrorsType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

export class ErrorWithStatus {
  messages: string
  status: number
  constructor({ messages, status }: { messages: string; status: number }) {
    this.messages = messages
    this.status = status
  }
}

export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  constructor({ messages = USERS_MESSAGES.VALIDATION_ERROR, errors }: { messages?: string; errors: ErrorsType }) {
    super({ messages, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}
