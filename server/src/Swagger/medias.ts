/**
 * @swagger
 * /medias/upload-image:
 *   post:
 *     summary: Upload image
 *     description: Upload image files (max 4 files, 300KB each)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 4
 *                 description: Image files to upload (max 4 files, 300KB each)
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Upload success
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Media'
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified
 *       413:
 *         description: File too large
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /medias/upload-video:
 *   post:
 *     summary: Upload video
 *     description: Upload video file (max 50MB, MP4/MOV format)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file to upload (max 50MB, MP4/MOV)
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Upload success
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Media'
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified
 *       413:
 *         description: File too large
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /medias/upload-video-hls:
 *   post:
 *     summary: Upload video for HLS streaming
 *     description: Upload video file for HLS (HTTP Live Streaming) processing
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file to upload for HLS processing (max 50MB)
 *     responses:
 *       200:
 *         description: Video uploaded for HLS processing successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Upload success
 *                 result:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Media'
 *                       - type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [HLS]
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified
 *       413:
 *         description: File too large
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /medias/video-status/{id}:
 *   get:
 *     summary: Get video processing status
 *     description: Get the encoding status of uploaded video for HLS
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID to check status
 *     responses:
 *       200:
 *         description: Video status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get video status success
 *                 result:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Status record ID
 *                     name:
 *                       type: string
 *                       description: Video file name
 *                     status:
 *                       type: string
 *                       enum: [Pending, Processing, Success, Failed]
 *                       description: Processing status
 *                     message:
 *                       type: string
 *                       description: Status message
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     update_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified
 *       404:
 *         description: Video status not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /static/image/{name}:
 *   get:
 *     summary: Serve image file
 *     description: Serve uploaded image file
 *     tags: [Static Files]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Image file name
 *     responses:
 *       200:
 *         description: Image file
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /static/video-stream/{name}:
 *   get:
 *     summary: Stream video file
 *     description: Stream video file with range support
 *     tags: [Static Files]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Video file name
 *       - in: header
 *         name: Range
 *         schema:
 *           type: string
 *         description: Range header for partial content
 *         example: "bytes=0-1023"
 *     responses:
 *       200:
 *         description: Full video file
 *         content:
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Length:
 *             schema:
 *               type: integer
 *             description: Total file size
 *           Content-Type:
 *             schema:
 *               type: string
 *             description: Video MIME type
 *       206:
 *         description: Partial video content
 *         content:
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Range:
 *             schema:
 *               type: string
 *             description: Range of bytes being served
 *             example: "bytes 0-1023/2048"
 *           Accept-Ranges:
 *             schema:
 *               type: string
 *             description: Accepted range unit
 *             example: "bytes"
 *           Content-Length:
 *             schema:
 *               type: integer
 *             description: Size of current chunk
 *       404:
 *         description: Video not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 
 
 */
