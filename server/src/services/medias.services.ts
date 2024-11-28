import { Request } from 'express'
import { getFiles, getNameFromFullname, handleUploadImage, handleUploadVideo, handleUploadVideoHLS } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGES_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_HLS_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'
import mime from 'mime'
import { envConfig, isProduction } from '~/constants/config'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import databaseService from './database.services'
import { uploadFileS3 } from '~/utils/s3'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import { EncodingStatus, MediaType } from '~/constants/enum'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import { Media } from '~/models/Other'

class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }
  async enqueue(item: string) {
    this.items.push(item)
    const idName = item.replace(/\\/g, '\\\\').split('\\').pop() as string
    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending
      })
    )
    this.processEncode()
  }
  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      const idName = videoPath.replace(/\\/g, '\\\\').split('\\').pop() as string
      await databaseService.videoStatus.updateOne(
        { name: idName },
        {
          $set: {
            status: EncodingStatus.Processing
          },
          $currentDate: {
            update_at: true
          }
        }
      )
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()

        const files = getFiles(path.resolve(UPLOAD_VIDEO_HLS_DIR, idName))
        files.map((filepath) => {
          const fileName = 'videos-hls/' + filepath.replace(path.resolve(UPLOAD_VIDEO_HLS_DIR), '')
          return uploadFileS3({
            filePath: filepath,
            filename: fileName,
            contentType: mime.getType(filepath) as string
          })
        })
        fs.unlinkSync(videoPath)
        // await Promise.all([fsPromise.unlink(videoPath), fsPromise.unlink(path.resolve(UPLOAD_VIDEO_HLS_DIR, idName))])
        await databaseService.videoStatus.updateOne(
          { name: idName },
          {
            $set: {
              status: EncodingStatus.Success
            },
            $currentDate: {
              update_at: true
            }
          }
        )
        console.log(`Encode video ${videoPath} success`)
      } catch (error) {
        await databaseService.videoStatus
          .updateOne(
            { name: idName },
            {
              $set: {
                status: EncodingStatus.Failed
              },
              $currentDate: {
                update_at: true
              }
            }
          )
          .catch((err) => {
            console.log('Update video status error ', err)
          })
        console.error(`Encode video ${videoPath} error`)
        console.error(error)
      }
      this.encoding = false
      this.processEncode()
    } else {
      console.log('Encode video queue is empty')
    }
  }
}

const queue = new Queue()
class MediaService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newFullFileName = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGES_DIR, newFullFileName)
        await sharp(file.filepath).jpeg().toFile(newPath)
        const s3Result = await uploadFileS3({
          filename: 'Images/' + newFullFileName,
          filePath: newPath,
          contentType: mime.getType(newFullFileName) as string
        })
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location,
          type: MediaType.Image
        }
        // return {
        //   url: isProduction
        //     ? `${envConfig.host}/static/image/${newFullFileName}`
        //     : `http://localhost:${envConfig.port}/static/image/${newFullFileName}`,
        //   type: MediaType.Image
        // }
      })
    )
    return result
  }
  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result = await Promise.all(
      files.map(async (file) => {
        const s3Result = await uploadFileS3({
          filename: 'Videos/' + file.newFilename,
          contentType: file.mimetype as string,
          filePath: file.filepath
        })
        const newPath = path.resolve(UPLOAD_VIDEO_DIR, `${file.newFilename}.mp4`)
        await fs.promises.copyFile(file.filepath, newPath)
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location,
          type: MediaType.Video
        }
        // return {
        //   url: isProduction
        //     ? `${envConfig.host}/static/video-stream/${file.newFilename}.mp4`
        //     : `http://localhost:${envConfig.port}/static/video-stream/${file.newFilename}.mp4`,
        //   type: MediaType.Video
        // }
      })
    )
    return result
  }
  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideoHLS(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        queue.enqueue(file.filepath)
        return {
          url: isProduction
            ? `${envConfig.host}/static/video-hls/${file.newFilename}/master.m3u8`
            : `http://localhost:${envConfig.port}/static/video-hls/${file.newFilename}/master.m3u8`,
          type: MediaType.HLS
        }
      })
    )
    return result
  }
  async getVideoStatus(idStatus: string) {
    const result = await databaseService.videoStatus.findOne({ name: idStatus })
    return result
  }
}

const mediaService = new MediaService()
export default mediaService
