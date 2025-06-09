/**
 * @swagger
 * /groups/create:
 *   post:
 *     summary: Create group
 *     description: Create a new group chat
 *     tags: [Group Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - member_ids
 *             properties:
 *               name:
 *                 type: string
 *                 description: Group name
 *               description:
 *                 type: string
 *                 description: Group description
 *               member_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of member user IDs
 *               avatar:
 *                 type: string
 *                 description: Group avatar URL
 *     responses:
 *       200:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Create group successfully
 *                 result:
 *                   $ref: '#/components/schemas/Conversation'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified
 *       404:
 *         description: Some members not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /groups/{group_id}/add-member:
 *   post:
 *     summary: Add members to group
 *     description: Add new members to existing group (admin permission required)
 *     tags: [Group Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - member_ids
 *             properties:
 *               member_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of new member user IDs
 *     responses:
 *       200:
 *         description: Members added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Add member successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     added_members:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Admin permission required
 *       404:
 *         description: Group or members not found
 *       409:
 *         description: Member already in group
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /groups/{group_id}/remove-member:
 *   delete:
 *     summary: Remove member from group
 *     description: Remove a member from group (admin permission required)
 *     tags: [Group Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - member_id
 *             properties:
 *               member_id:
 *                 type: string
 *                 description: Member user ID to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Remove member successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Admin permission required or cannot remove owner
 *       404:
 *         description: Member not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /groups/{group_id}/leave:
 *   post:
 *     summary: Leave group
 *     description: Leave a group (owner cannot leave without transferring ownership)
 *     tags: [Group Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Left group successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Leave group successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Owner cannot leave or not a member
 *       404:
 *         description: Group not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /groups/{group_id}:
 *   put:
 *     summary: Update group
 *     description: Update group information (admin permission required)
 *     tags: [Group Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New group name
 *               description:
 *                 type: string
 *                 description: New group description
 *               avatar:
 *                 type: string
 *                 description: New group avatar URL
 *     responses:
 *       200:
 *         description: Group updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Update group successfully
 *                 result:
 *                   $ref: '#/components/schemas/Conversation'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Admin permission required
 *       404:
 *         description: Group not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   get:
 *     summary: Get group info
 *     description: Get group information and member count
 *     tags: [Group Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group info retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get group info successfully
 *                 result:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Conversation'
 *                     - type: object
 *                       properties:
 *                         member_count:
 *                           type: integer
 *                         user_role:
 *                           type: string
 *                           enum: [owner, admin, member]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not a group member
 *       404:
 *         description: Group not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /groups/{group_id}/members:
 *   get:
 *     summary: Get group members
 *     description: Get list of group members with their roles
 *     tags: [Group Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
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
 *         description: Number of members per page
 *     responses:
 *       200:
 *         description: Group members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get group members successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/GroupMember'
 *                       - type: object
 *                         properties:
 *                           user:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                               avatar:
 *                                 type: string
 *                               bio:
 *                                 type: string
 *                 page:
 *                   type: integer
 *                 total_pages:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not a group member
 *       404:
 *         description: Group not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /groups/user:
 *   get:
 *     summary: Get user groups
 *     description: Get all groups that user is a member of
 *     tags: [Group Chat]
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
 *         description: Number of groups per page
 *     responses:
 *       200:
 *         description: User groups retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get user groups successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Conversation'
 *                       - type: object
 *                         properties:
 *                           member_count:
 *                             type: integer
 *                           user_role:
 *                             type: string
 *                             enum: [owner, admin, member]
 *                           joined_at:
 *                             type: string
 *                             format: date-time
 *                 page:
 *                   type: integer
 *                 total_pages:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /groups/{group_id}/make-admin/{member_id}:
 *   post:
 *     summary: Make member admin
 *     description: Promote a member to admin role (owner permission required)
 *     tags: [Group Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: group_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *       - in: path
 *         name: member_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID to promote
 *     responses:
 *       200:
 *         description: Member promoted to admin successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Make admin successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Owner permission required
 *       404:
 *         description: Member not found
 *       409:
 *         description: Already admin
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /notifications:
 *   get:
 *     summary: Get notifications
 *     description: Get notifications for authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [unread, read]
 *         description: Filter by notification status
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
 *         description: Number of notifications per page
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get notifications successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Notification'
 *                       - type: object
 *                         properties:
 *                           sender:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                               avatar:
 *                                 type: string
 *                 page:
 *                   type: integer
 *                 total_pages:
 *                   type: integer
 *                 unread_count:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /notifications/{notification_id}/read:
 *   put:
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mark notification as read successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Notification not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /notifications/mark-all-read:
 *   put:
 *     summary: Mark all notifications as read
 *     description: Mark all user notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mark all notifications as read successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     marked_count:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /notifications/{notification_id}:
 *   delete:
 *     summary: Delete notification
 *     description: Delete a specific notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Delete notification successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Notification not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /notifications/unread-count:
 *   get:
 *     summary: Get unread notifications count
 *     description: Get count of unread notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get unread count successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     unread_count:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /notifications/clear-all:
 *   delete:
 *     summary: Clear all notifications
 *     description: Delete all user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Clear all notifications successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     deleted_count:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
