import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'

export const paginationValidator = validate(
  checkSchema(
    {
      page: {
        isNumeric: true,
        custom: {
          options: (value) => {
            if (Number(value) < 1) {
              throw new Error('page must be greater than 0')
            }
            return true
          }
        }
      },
      limit: {
        isNumeric: true,
        custom: {
          options: (value) => {
            const num = Number(value)
            if (num < 1 || num > 100) {
              throw new Error('limit must be greater than 0')
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
