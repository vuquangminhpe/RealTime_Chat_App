// socketDocs.ts - Phiên bản đơn giản
/**
 * @swagger
 * components:
 *   schemas:
 *     SocketAuth:
 *       type: object
 *       properties:
 *         Authorization:
 *           type: string
 *           description: Bearer token for authentication
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user_id:
 *           type: string
 *           description: User ID (set by server after authentication)
 *     
 *     SocketMessage:
 *       type: object
 *       properties:
 *         conversation_id:
 *           type: string
 *           description: ID of the conversation
 *         content:
 *           type: string
 *           description: Message content
 *         message_type:
 *           type: string
 *           enum: [text, image, video, file, audio]
 *           default: text
 *         reply_to:
 *           type: string
 *           description: ID of message being replied to
 *           
 *     SocketTyping:
 *       type: object
 *       properties:
 *         conversation_id:
 *           type: string
 *           description: ID of the conversation
 *           
 *     SocketReaction:
 *       type: object
 *       properties:
 *         target_id:
 *           type: string
 *           description: ID of the target (message, story, comment)
 *         target_type:
 *           type: string
 *           enum: [story, message, comment]
 *         reaction_type:
 *           type: string
 *           enum: [like, love, haha, wow, sad, angry]
 */

/**
 * @swagger
 * tags:
 *   - name: Socket.IO Events
 *     description: |
 *       Real-time communication events for the chat application using Socket.IO.
 *       
 *       ## Connection Setup
 *       ```javascript
 *       const socket = io('http://localhost:3000', {
 *         auth: {
 *           Authorization: 'Bearer your_jwt_token_here'
 *         }
 *       });
 *       ```
 *       
 *       ## Client Events (emit to server)
 *       - **send-message**: Send a message
 *       - **mark-message-read**: Mark messages as read  
 *       - **typing-start**: Start typing indicator
 *       - **typing-stop**: Stop typing indicator
 *       - **join-conversation**: Join conversation room
 *       - **leave-conversation**: Leave conversation room
 *       - **add-reaction**: Add reaction to content
 *       - **status-change**: Change online/offline status
 *       
 *       ## Server Events (listen from server)
 *       - **message-sent**: Message sent confirmation
 *       - **receive-message**: New message received
 *       - **messages-read**: Messages read notification
 *       - **user-typing**: User typing indicator
 *       - **reaction-added**: Reaction added notification
 *       - **friend-status-change**: Friend status change
 *       - **error**: Error occurred
 *       
 *       ## Connection Events  
 *       - **connect**: Successfully connected
 *       - **disconnect**: Disconnected from server
 *       - **connect_error**: Connection failed
 */

/**
 * @swagger
 * /socket.io-events:
 *   get:
 *     tags: [Socket.IO Events]
 *     summary: Socket.IO Events Documentation
 *     description: |
 *       ## Socket.IO Real-time Events
 *       
 *       ### Authentication
 *       All socket connections require JWT authentication:
 *       ```javascript
 *       const socket = io('ws://localhost:3000', {
 *         auth: { Authorization: 'Bearer <token>' }
 *       });
 *       ```
 *       
 *       ### Client Events (Emit to Server)
 *       
 *       **send-message**
 *       ```javascript
 *       socket.emit('send-message', {
 *         payload: {
 *           conversation_id: 'string',
 *           content: 'string', 
 *           message_type: 'text|image|video|file|audio',
 *           reply_to: 'string' // optional
 *         }
 *       });
 *       ```
 *       
 *       **typing-start / typing-stop**
 *       ```javascript
 *       socket.emit('typing-start', { conversation_id: 'string' });
 *       socket.emit('typing-stop', { conversation_id: 'string' });
 *       ```
 *       
 *       **join-conversation / leave-conversation**
 *       ```javascript
 *       socket.emit('join-conversation', { conversation_id: 'string' });
 *       socket.emit('leave-conversation', { conversation_id: 'string' });
 *       ```
 *       
 *       **mark-message-read**
 *       ```javascript
 *       socket.emit('mark-message-read', { conversation_id: 'string' });
 *       ```
 *       
 *       **add-reaction**
 *       ```javascript
 *       socket.emit('add-reaction', {
 *         target_id: 'string',
 *         target_type: 'story|message|comment',
 *         reaction_type: 'like|love|haha|wow|sad|angry'
 *       });
 *       ```
 *       
 *       **status-change**
 *       ```javascript
 *       socket.emit('status-change', { status: 'online|offline' });
 *       ```
 *       
 *       ### Server Events (Listen from Server)
 *       
 *       **receive-message**
 *       ```javascript
 *       socket.on('receive-message', (data) => {
 *         const { payload } = data; // Message object with sender info
 *       });
 *       ```
 *       
 *       **user-typing**
 *       ```javascript
 *       socket.on('user-typing', (data) => {
 *         const { user_id, typing } = data; // boolean typing status
 *       });
 *       ```
 *       
 *       **messages-read**
 *       ```javascript
 *       socket.on('messages-read', (data) => {
 *         const { conversation_id, read_by } = data;
 *       });
 *       ```
 *       
 *       **reaction-added**
 *       ```javascript
 *       socket.on('reaction-added', (data) => {
 *         const { target_id, target_type, reaction_type, user_id } = data;
 *       });
 *       ```
 *       
 *       **friend-status-change**
 *       ```javascript
 *       socket.on('friend-status-change', (data) => {
 *         const { user_id, status } = data; // online/offline
 *       });
 *       ```
 *       
 *       **error**
 *       ```javascript
 *       socket.on('error', (data) => {
 *         console.error('Socket error:', data.message);
 *       });
 *       ```
 *       
 *       ### Connection Events
 *       
 *       ```javascript
 *       socket.on('connect', () => {
 *         console.log('Connected:', socket.id);
 *       });
 *       
 *       socket.on('disconnect', (reason) => {
 *         console.log('Disconnected:', reason);
 *       });
 *       
 *       socket.on('connect_error', (error) => {
 *         console.error('Connection failed:', error.message);
 *       });
 *       ```
 *     responses:
 *       200:
 *         description: Socket.IO events documentation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     type: string
 *                 description:
 *                   type: string
 */

// Export empty object để file được import thành công
export default {};
