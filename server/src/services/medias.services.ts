import { Request } from 'express'
import {
  getFiles,
  getNameFromFullname,
  handleUploadImage,
  handleUploadVideo,
  handleUploadVideoHLS
} from '../utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGES_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_HLS_DIR } from '../constants/dir'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { Media } from '../models/Other'
import { encodeHLSWithMultipleVideoStreams } from '../utils/video'
import databaseService from './database.services'
import VideoStatus from '../models/schemas/VideoStatus.schema'
import { uploadFileS3 } from '../utils/s3'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import { EncodingStatus, MediaType } from '~/constants/enum'

let mime: any
;(async () => {
  const mimeModule = await import('mime')
  mime = mimeModule
})()

const isRender = process.env.RENDER === 'true' || process.env.RENDER_SERVICE_ID

// Aggressive cleanup function cho Render
const immediateCleanup = async (filePaths: string[]) => {
  const cleanupPromises = filePaths.map(async (filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        await fsPromise.unlink(filePath)
        console.log(`🗑️ Cleaned: ${path.basename(filePath)}`)
      }
    } catch (error) {
      console.warn(`Failed to cleanup ${filePath}:`, error)
    }
  })

  await Promise.allSettled(cleanupPromises)
}

class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }

  async enqueue(item: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.items.push(item)
      const idName = item.replace(/\\/g, '\\\\').split('\\').pop() as string
      databaseService.videoStatus
        .insertOne(
          new VideoStatus({
            name: idName,
            status: EncodingStatus.Pending
          })
        )
        .then(() => {
          this.processEncode(resolve, reject)
        })
        .catch(reject)
    })
  }

  async processEncode(onComplete?: (m3u8Url: string) => void, onError?: (error: any) => void) {
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
        let m3u8Url = ''
        const filesToCleanup: string[] = []

        await Promise.all(
          files.map(async (filepath) => {
            filesToCleanup.push(filepath)
            const fileName = 'videos-hls/' + filepath.replace(path.resolve(UPLOAD_VIDEO_HLS_DIR), '')
            const s3Upload = await uploadFileS3({
              filePath: filepath,
              filename: fileName,
              contentType: mime.default.getType(filepath) as string
            })

            if (filepath.endsWith('/master.m3u8')) {
              m3u8Url = (s3Upload as CompleteMultipartUploadCommandOutput).Location as string
            }
            return s3Upload
          })
        )

        // Cleanup ngay sau khi upload lên S3
        await immediateCleanup([videoPath, ...filesToCleanup])

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

        console.log(`✅ Encoded and cleaned up video: ${idName}`)

        if (onComplete && m3u8Url) onComplete(m3u8Url)
      } catch (error) {
        // Cleanup on error
        await immediateCleanup([videoPath])

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
            console.log('Update video status error', err)
          })
        console.error(`❌ Encode video ${videoPath} error`, error)
        if (onError) onError(error)
      }

      this.encoding = false
      this.processEncode()
    }
  }
}

const queue = new Queue()

class MediaService {
  async uploadImage(req: Request) {
    const startTime = Date.now()
    const filesToCleanup: string[] = []

    try {
      console.log('📤 Starting image upload...')
      const files = await handleUploadImage(req)

      const result = await Promise.all(
        files.map(async (file, index) => {
          const fileStartTime = Date.now()
          filesToCleanup.push(file.filepath)

          try {
            // Kiểm tra file tồn tại
            if (!fs.existsSync(file.filepath)) {
              throw new Error(`Uploaded file not found: ${file.filepath}`)
            }

            const newName = getNameFromFullname(file.newFilename)
            const newFullFileName = `${newName}.jpg`
            const processedPath = path.resolve(UPLOAD_IMAGES_DIR, newFullFileName)
            filesToCleanup.push(processedPath)

            // Đảm bảo thư mục images tồn tại
            if (!fs.existsSync(UPLOAD_IMAGES_DIR)) {
              fs.mkdirSync(UPLOAD_IMAGES_DIR, { recursive: true })
            }

            // Xử lý ảnh với sharp (với options tối ưu cho Render)
            try {
              await sharp(file.filepath)
                .jpeg({
                  quality: 85, // Giảm quality để tiết kiệm dung lượng
                  progressive: true
                })
                .resize(2048, 2048, {
                  fit: 'inside',
                  withoutEnlargement: true
                })
                .toFile(processedPath)
            } catch (sharpError) {
              console.warn('Sharp processing failed, using direct copy:', sharpError)
              await fs.promises.copyFile(file.filepath, processedPath)
            }

            // Upload lên S3 ngay lập tức
            const s3Result = await uploadFileS3({
              filename: 'Images/' + newFullFileName,
              filePath: processedPath,
              contentType: mime.default.getType(newFullFileName) as string
            })

            console.log(`✅ File ${index + 1} uploaded in ${Date.now() - fileStartTime}ms`)

            return {
              url: (s3Result as CompleteMultipartUploadCommandOutput).Location,
              type: MediaType.Image
            }
          } catch (fileError) {
            console.error('Error processing file:', file.filepath, fileError)
            throw fileError
          }
        })
      )

      console.log(`🎉 All images uploaded in ${Date.now() - startTime}ms`)
      return result
    } catch (error) {
      console.error('❌ Upload image service error:', error)
      throw error
    } finally {
      // Cleanup tất cả files bất kể thành công hay thất bại
      if (filesToCleanup.length > 0) {
        console.log(`🧹 Cleaning up ${filesToCleanup.length} files...`)
        await immediateCleanup(filesToCleanup)
      }
    }
  }

  async uploadVideo(req: Request) {
    const filesToCleanup: string[] = []

    try {
      const files = await handleUploadVideo(req)

      const result = await Promise.all(
        files.map(async (file) => {
          filesToCleanup.push(file.filepath)

          const s3Result = await uploadFileS3({
            filename: 'Videos/' + file.newFilename,
            contentType: file.mimetype as string,
            filePath: file.filepath
          })

          // Không tạo local copy cho video trên Render
          // Vì sẽ tốn dung lượng và không cần thiết

          return {
            url: (s3Result as CompleteMultipartUploadCommandOutput).Location,
            type: MediaType.Video
          }
        })
      )

      return result
    } finally {
      await immediateCleanup(filesToCleanup)
    }
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideoHLS(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const m3u8Url = await queue.enqueue(file.filepath)

        return {
          url: m3u8Url,
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

// Render.com: Setup cleanup interval để giữ /tmp sạch sẽ
if (isRender) {
  setInterval(
    async () => {
      try {
        const tempFiles = fs.readdirSync('/tmp')
        const oldFiles = tempFiles.filter((file) => {
          try {
            const filePath = path.join('/tmp', file)
            const stats = fs.statSync(filePath)
            const age = Date.now() - stats.mtime.getTime()
            return age > 30 * 60 * 1000 // 30 minutes
          } catch {
            return false
          }
        })

        if (oldFiles.length > 0) {
          await immediateCleanup(oldFiles.map((f) => path.join('/tmp', f)))
          console.log(`🧹 Cleaned ${oldFiles.length} old files from /tmp`)
        }
      } catch (error) {
        console.error('Periodic cleanup error:', error)
      }
    },
    10 * 60 * 1000
  ) // Every 10 minutes
}

export default mediaService
