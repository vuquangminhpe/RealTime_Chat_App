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
 * /socket.io:
 *   description: |
 *     ## Socket.IO Real-time Communication
 *
 *     The chat application uses Socket.IO for real-time communication. Below are the available events:
 *
 *     ### Connection
 *
 *     **Authentication Required**: All socket connections must include a valid JWT token in the handshake auth.
 *
 *     ```javascript
 *     const socket = io('http://localhost:3000', {
 *       auth: {
 *         Authorization: 'Bearer your_jwt_token_here'
 *       }
 *     });
 *     ```
 *
 *     ### Client Events (Emit to Server)
 *
 *     #### **send-message**
 *     Send a message in a conversation
 *     ```javascript
 *     socket.emit('send-message', {
 *       payload: {
 *         conversation_id: 'string',
 *         content: 'string',
 *         message_type: 'text|image|video|file|audio', // optional, default: 'text'
 *         medias: [Media], // optional
 *         reply_to: 'string' // optional, message ID being replied to
 *       }
 *     });
 *     ```
 *
 *     #### **mark-message-read**
 *     Mark messages in a conversation as read
 *     ```javascript
 *     socket.emit('mark-message-read', {
 *       conversation_id: 'string'
 *     });
 *     ```
 *
 *     #### **typing-start**
 *     Indicate user started typing
 *     ```javascript
 *     socket.emit('typing-start', {
 *       conversation_id: 'string'
 *     });
 *     ```
 *
 *     #### **typing-stop**
 *     Indicate user stopped typing
 *     ```javascript
 *     socket.emit('typing-stop', {
 *       conversation_id: 'string'
 *     });
 *     ```
 *
 *     #### **join-conversation**
 *     Join a conversation room for real-time updates
 *     ```javascript
 *     socket.emit('join-conversation', {
 *       conversation_id: 'string'
 *     });
 *     ```
 *
 *     #### **leave-conversation**
 *     Leave a conversation room
 *     ```javascript
 *     socket.emit('leave-conversation', {
 *       conversation_id: 'string'
 *     });
 *     ```
 *
 *     #### **add-reaction**
 *     Add reaction to content (for real-time updates)
 *     ```javascript
 *     socket.emit('add-reaction', {
 *       target_id: 'string',
 *       target_type: 'story|message|comment',
 *       reaction_type: 'like|love|haha|wow|sad|angry'
 *     });
 *     ```
 *
 *     #### **status-change**
 *     Change user online/offline status
 *     ```javascript
 *     socket.emit('status-change', {
 *       status: 'online|offline'
 *     });
 *     ```
 *
 *     ---
 *
 *     ### Server Events (Listen from Server)
 *
 *     #### **message-sent**
 *     Confirmation that message was sent successfully
 *     ```javascript
 *     socket.on('message-sent', (data) => {
 *       // data.payload contains the sent message with sender info
 *       console.log('Message sent:', data.payload);
 *     });
 *     ```
 *
 *     #### **receive-message**
 *     Receive a new message from another user
 *     ```javascript
 *     socket.on('receive-message', (data) => {
 *       // data.payload contains the message with sender info
 *       const message = data.payload;
 *       console.log('New message from:', message.sender.username);
 *     });
 *     ```
 *
 *     #### **messages-read**
 *     Notification that messages were read by another user
 *     ```javascript
 *     socket.on('messages-read', (data) => {
 *       // data: { conversation_id, read_by }
 *       console.log(`Messages read by user: ${data.read_by}`);
 *     });
 *     ```
 *
 *     #### **user-typing**
 *     Another user is typing indicator
 *     ```javascript
 *     socket.on('user-typing', (data) => {
 *       // data: { user_id, typing: true/false }
 *       if (data.typing) {
 *         console.log(`User ${data.user_id} is typing...`);
 *       } else {
 *         console.log(`User ${data.user_id} stopped typing`);
 *       }
 *     });
 *     ```
 *
 *     #### **reaction-added**
 *     Someone added a reaction to content
 *     ```javascript
 *     socket.on('reaction-added', (data) => {
 *       // data: { target_id, target_type, reaction_type, user_id }
 *       console.log(`User ${data.user_id} reacted with ${data.reaction_type}`);
 *     });
 *     ```
 *
 *     #### **friend-status-change**
 *     Friend's online/offline status changed
 *     ```javascript
 *     socket.on('friend-status-change', (data) => {
 *       // data: { user_id, status }
 *       console.log(`Friend ${data.user_id} is now ${data.status}`);
 *     });
 *     ```
 *
 *     #### **error**
 *     Error occurred during socket operation
 *     ```javascript
 *     socket.on('error', (data) => {
 *       // data: { message }
 *       console.error('Socket error:', data.message);
 *     });
 *     ```
 *
 *     ---
 *
 *     ### Connection Events
 *
 *     #### **connect**
 *     Successfully connected to server
 *     ```javascript
 *     socket.on('connect', () => {
 *       console.log('Connected to server');
 *       console.log('Socket ID:', socket.id);
 *     });
 *     ```
 *
 *     #### **disconnect**
 *     Disconnected from server
 *     ```javascript
 *     socket.on('disconnect', (reason) => {
 *       console.log('Disconnected:', reason);
 *       // reason can be: 'io server disconnect', 'io client disconnect', 'ping timeout', etc.
 *     });
 *     ```
 *
 *     #### **connect_error**
 *     Connection failed (usually authentication error)
 *     ```javascript
 *     socket.on('connect_error', (error) => {
 *       console.error('Connection failed:', error.message);
 *       // Common errors: 'Authentication token is missing', 'Invalid or expired token'
 *     });
 *     ```
 *
 *     ---
 *
 *     ### Best Practices
 *
 *     1. **Always handle connection errors**: Implement `connect_error` handler for authentication issues
 *     2. **Join conversation rooms**: Use `join-conversation` when opening a chat to receive real-time updates
 *     3. **Leave rooms when done**: Use `leave-conversation` when closing a chat to avoid unnecessary updates
 *     4. **Handle typing indicators properly**: Start typing on input focus, stop on blur or message send
 *     5. **Implement message delivery status**: Use message status (sent, delivered, read) for better UX
 *     6. **Auto-reconnection**: Socket.IO handles auto-reconnection, but you may want to refresh auth tokens
 *
 *     ### Example Implementation
 *
 *     ```javascript
 *     import io from 'socket.io-client';
 *
 *     class ChatSocket {
 *       constructor(token) {
 *         this.socket = io('http://localhost:3000', {
 *           auth: {
 *             Authorization: `Bearer ${token}`
 *           }
 *         });
 *
 *         this.setupEventListeners();
 *       }
 *
 *       setupEventListeners() {
 *         this.socket.on('connect', () => {
 *           console.log('Connected to chat server');
 *         });
 *
 *         this.socket.on('connect_error', (error) => {
 *           console.error('Connection failed:', error.message);
 *           // Handle token refresh or redirect to login
 *         });
 *
 *         this.socket.on('receive-message', (data) => {
 *           this.handleNewMessage(data.payload);
 *         });
 *
 *         this.socket.on('user-typing', (data) => {
 *           this.handleTypingIndicator(data);
 *         });
 *
 *         this.socket.on('friend-status-change', (data) => {
 *           this.updateFriendStatus(data.user_id, data.status);
 *         });
 *       }
 *
 *       sendMessage(conversationId, content, type = 'text') {
 *         this.socket.emit('send-message', {
 *           payload: {
 *             conversation_id: conversationId,
 *             content: content,
 *             message_type: type
 *           }
 *         });
 *       }
 *
 *       joinConversation(conversationId) {
 *         this.socket.emit('join-conversation', {
 *           conversation_id: conversationId
 *         });
 *       }
 *
 *       startTyping(conversationId) {
 *         this.socket.emit('typing-start', {
 *           conversation_id: conversationId
 *         });
 *       }
 *
 *       stopTyping(conversationId) {
 *         this.socket.emit('typing-stop', {
 *           conversation_id: conversationId
 *         });
 *       }
 *
 *       markMessagesRead(conversationId) {
 *         this.socket.emit('mark-message-read', {
 *           conversation_id: conversationId
 *         });
 *       }
 *
 *       disconnect() {
 *         this.socket.disconnect();
 *       }
 *     }
 *
 *     // Usage
 *     const chatSocket = new ChatSocket(userToken);
 *     ```
 *   tags: [Socket.IO Events]
 */
