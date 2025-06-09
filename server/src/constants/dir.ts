import path from 'path'
import os from 'os'
import fs from 'fs'
const isProduction = process.env.NODE_ENV === 'production'
const isRender = process.env.RENDER === 'true' || process.env.RENDER_SERVICE_ID

const getBaseDir = () => {
  if (isRender || isProduction) {
    // Render.com chỉ cho phép ghi vào /tmp
    console.log('🚀 Detected Render.com environment, using /tmp directory')
    return '/tmp'
  }

  return process.cwd()
}

const BASE_DIR = getBaseDir()

// Trên Render.com, tất cả đều phải dùng /tmp
export const UPLOAD_TEMP_DIR = path.resolve(BASE_DIR, 'uploads/temp')
export const UPLOAD_IMAGES_DIR = path.resolve(BASE_DIR, 'uploads/images')
export const UPLOAD_VIDEO_DIR = path.resolve(BASE_DIR, 'uploads/video')
export const UPLOAD_VIDEO_HLS_DIR = path.resolve(BASE_DIR, 'uploads/video-hls')

// Log để debug
console.log('📁 Upload Configuration:')
console.log(`   Environment: ${process.env.NODE_ENV}`)
console.log(`   Platform: ${os.platform()}`)
console.log(`   Base Directory: ${BASE_DIR}`)
console.log(`   Render Detected: ${isRender ? 'Yes' : 'No'}`)
console.log(`   Temp Dir: ${UPLOAD_TEMP_DIR}`)

// Kiểm tra quyền ghi ngay khi import
try {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, { recursive: true })
    console.log('✅ Created upload directories successfully')
  }

  // Test write permission
  const testFile = path.join(UPLOAD_TEMP_DIR, 'test-' + Date.now())
  fs.writeFileSync(testFile, 'test')
  fs.unlinkSync(testFile)
  console.log('✅ Write permissions confirmed')
} catch (error) {
  console.error('❌ Upload directory setup failed:', error)
}
