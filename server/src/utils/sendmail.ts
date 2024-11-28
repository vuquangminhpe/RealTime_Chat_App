import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { envConfig } from '~/constants/config'
config()
// Create SES service object.
const sesClient = new SESClient({
  region: envConfig.region as string,
  credentials: {
    secretAccessKey: envConfig.secretAccessKey as string,
    accessKeyId: envConfig.accessKeyId as string
  }
})

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string | string[]
  body: string
  subject: string
  replyToAddresses?: string | string[]
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

export const sendVerifyEmail = async (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: envConfig.fromAddress as string,
    toAddresses: toAddress,
    body,
    subject
  })

  return sesClient.send(sendEmailCommand)
}

const verifyEmailTemplate = fs.readFileSync(path.resolve('src/templates/verify-email.html'), 'utf-8')
export const verifyEmail = (toAddress: string, email_verify_token: string, template: string = verifyEmailTemplate) => {
  return sendVerifyEmail(
    toAddress,
    'Verify your email',
    template
      .replace('{{link}}', `${envConfig.client_url}/verify-email?token=${email_verify_token}`)
      .replace('{{name}}', `${toAddress.split('@')[0]?.split('+')[0]}`)
  )
}
export const verifyForgotPassword = (
  toAddress: string,
  forgot_verify_token: string,
  template: string = verifyEmailTemplate
) => {
  return sendVerifyEmail(
    toAddress,
    'Verify your email',
    template
      .replace('{{link}}', `${envConfig.client_url}/verify-forgot-password?token=${forgot_verify_token}`)
      .replace('{{name}}', `${toAddress.split('@')[0]?.split('+')[0]}`)
  )
}
