import { Response, Request, NextFunction } from 'express'
import { USERS_MESSAGES } from '~/constants/messages'
import mediaService from '~/services/medias.services'
import path from 'path'
import mime from 'mime'
import fs from 'fs'
import { UPLOAD_IMAGES_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { sendFileFromS3 } from '~/utils/s3'
export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediaService.uploadImage(req)
  res.json({ message: USERS_MESSAGES.UPLOAD_SUCCESS, result: url })
}
export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediaService.uploadVideo(req)
  res.json({ message: USERS_MESSAGES.UPLOAD_SUCCESS, result: url })
}
export const uploadVideoHLSController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediaService.uploadVideoHLS(req)
  res.json({ message: USERS_MESSAGES.UPLOAD_SUCCESS, result: url })
}
export const videoStatusController = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const result = await mediaService.getVideoStatus(id as string)
  res.json({ message: USERS_MESSAGES.GET_VIDEO_STATUS_SUCCESS, result: result })
}

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  res.sendFile(path.resolve(UPLOAD_IMAGES_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

export const serveVideoStreamController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.params
    const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)

    const videoSize = fs.statSync(videoPath).size
    const range = req.headers.range

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1

      const chunksize = end - start + 1
      const file = fs.createReadStream(videoPath, { start, end })
      const head = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mime.getType(videoPath) || 'video/mp4'
      }

      res.writeHead(206, head)
      file.pipe(res)
    } else {
      const head = {
        'Content-Length': videoSize,
        'Content-Type': mime.getType(videoPath) || 'video/mp4'
      }
      res.writeHead(200, head)
      fs.createReadStream(videoPath).pipe(res)
    }
  } catch (error) {
    console.error('Video Streaming Error:', error)
    res.status(500).send('Internal Server Error')
  }
}

export const serveVideoM3u8Controller = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  sendFileFromS3(res, `videos-hls/${id}/master.m3u8`)
  // res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, 'master.m3u8'), (err) => {
  //   if (err) {
  //     res.status((err as any).status).send('Not found')
  //   }
  // })
}
export const serveSegmentController = (req: Request, res: Response, next: NextFunction) => {
  const { id, v, segment } = req.params
  sendFileFromS3(res, `videos-hls/${id}/${v}/${segment}`)
  // res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, v, segment), (err) => {
  //   if (err) {
  //     res.status((err as any).status).send('Not found')
  //   }
  // })
}
