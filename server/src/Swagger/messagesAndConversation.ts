/**
 * @swagger
 * /conversations/get_all_conversations:
 *   get:
 *     summary: Get all conversations
 *     description: Get all conversations for the authenticated user
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get all conversation successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 *                 page:
 *                   type: integer
 *                 total_pages:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /conversations/receivers:
 *   get:
 *     summary: Get conversation with specific users
 *     description: Get conversation between current user and specified receivers
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: receiver_id
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Array of receiver IDs
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [private, group]
 *         description: Conversation type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get conversation successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     conversations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Conversation'
 *                     page:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified
 *       404:
 *         description: User not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /messages/send:
 *   post:
 *     summary: Send message
 *     description: Send a message in a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversation_id
 *               - content
 *             properties:
 *               conversation_id:
 *                 type: string
 *                 description: Conversation ID
 *               content:
 *                 type: string
 *                 description: Message content
 *               message_type:
 *                 type: string
 *                 enum: [text, image, video, file, audio]
 *                 default: text
 *                 description: Message type
 *               medias:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Media'
 *                 description: Media attachments
 *               reply_to:
 *                 type: string
 *                 description: ID of message being replied to
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Send message successfully
 *                 result:
 *                   $ref: '#/components/schemas/Message'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not a conversation participant
 *       404:
 *         description: Conversation not found
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /messages:
 *   get:
 *     summary: Get messages
 *     description: Get messages in a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of messages per page
 *       - in: query
 *         name: before_message_id
 *         schema:
 *           type: string
 *         description: Get messages before this message ID (for pagination)
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get messages successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 page:
 *                   type: integer
 *                 total_pages:
 *                   type: integer
 *                 has_more:
 *                   type: boolean
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not a conversation participant
 *       404:
 *         description: Conversation not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /messages/{message_id}:
 *   put:
 *     summary: Edit message
 *     description: Edit a message (only sender can edit)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: message_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: New message content
 *     responses:
 *       200:
 *         description: Message edited successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Edit message successfully
 *                 result:
 *                   $ref: '#/components/schemas/Message'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not your message
 *       404:
 *         description: Message not found
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Delete message
 *     description: Delete a message (only sender can delete)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: message_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID to delete
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Delete message successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not your message
 *       404:
 *         description: Message not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /messages/mark-read:
 *   post:
 *     summary: Mark messages as read
 *     description: Mark all messages in a conversation as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversation_id
 *             properties:
 *               conversation_id:
 *                 type: string
 *                 description: Conversation ID
 *     responses:
 *       200:
 *         description: Messages marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mark messages as read successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     modified_count:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not a conversation participant
 *       404:
 *         description: Conversation not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /messages/search:
 *   get:
 *     summary: Search messages
 *     description: Search messages in a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *       - in: query
 *         name: search_term
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of messages per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Search messages successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 page:
 *                   type: integer
 *                 total_pages:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not a conversation participant
 *       404:
 *         description: Conversation not found
 *       422:
 *         description: Search term is required
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
