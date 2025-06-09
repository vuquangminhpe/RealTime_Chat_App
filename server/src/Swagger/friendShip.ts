/**
 * @swagger
 * /friend-requests/add:
 *   post:
 *     summary: Send friend request
 *     description: Send a friend request to another user
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - friend_id
 *             properties:
 *               friend_id:
 *                 type: string
 *                 description: ID of the user to send friend request to
 *     responses:
 *       200:
 *         description: Friend request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Friend add successfully
 *                 result:
 *                   $ref: '#/components/schemas/FriendShip'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified or banned
 *       404:
 *         description: Friend not found
 *       409:
 *         description: Already friends or cannot add yourself
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /friend-requests/unfriend/{friend_id}:
 *   delete:
 *     summary: Remove friend
 *     description: Remove a friend from friends list
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friend_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the friend to remove
 *     responses:
 *       200:
 *         description: Friend removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Removed friend successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified
 *       404:
 *         description: Not friends
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /friend-requests/accept/{accept_friend_id}:
 *   post:
 *     summary: Accept friend request
 *     description: Accept a pending friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accept_friend_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose friend request to accept
 *     responses:
 *       200:
 *         description: Friend request accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Friend request accepted successfully
 *                 result:
 *                   $ref: '#/components/schemas/FriendShip'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified
 *       404:
 *         description: Friend request not found
 *       409:
 *         description: Already connected to this user
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /friend-requests/reject/{reject_friend_id}:
 *   delete:
 *     summary: Reject friend request
 *     description: Reject a pending friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reject_friend_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose friend request to reject
 *     responses:
 *       200:
 *         description: Friend request rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Friend request rejected successfully
 *                 result:
 *                   $ref: '#/components/schemas/FriendShip'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified
 *       404:
 *         description: Friend request not found
 *       409:
 *         description: Already rejected or blocked
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /friend-requests/get-requests-accept:
 *   get:
 *     summary: Get pending friend requests
 *     description: Get list of pending friend requests received by current user
 *     tags: [Friends]
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
 *         description: Friend requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get friend requests successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FriendShip'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /friend-requests/all-friends:
 *   get:
 *     summary: Get all friends
 *     description: Get list of all friends of current user
 *     tags: [Friends]
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
 *         description: Friends list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get all friends successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FriendShip'
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
 * /friend-requests/friendship-suggestions:
 *   get:
 *     summary: Get friend suggestions
 *     description: Get list of suggested users to add as friends
 *     tags: [Friends]
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
 *         description: Friend suggestions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get friend suggestions successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
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
 * /friend-requests/search-friends:
 *   get:
 *     summary: Search for users to add as friends
 *     description: Search for users by username to send friend requests
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term for username
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
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get friends successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                 total_pages:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified
 *       422:
 *         description: Search term is required
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /friend-requests/cancel_request_id:
 *   delete:
 *     summary: Cancel friend request
 *     description: Cancel a friend request that was sent
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cancel_request_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to cancel friend request to
 *     responses:
 *       200:
 *         description: Friend request cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cancel friend request successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified
 *       404:
 *         description: Friend request not found
 *       409:
 *         description: Cannot cancel request to this user
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
