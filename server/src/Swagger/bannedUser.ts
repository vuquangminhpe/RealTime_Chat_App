/**
 * @swagger
 * /ban_users/{banned_user_id}:
 *   post:
 *     summary: Ban user
 *     description: Ban a user from the platform (admin/moderator only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: banned_user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to ban
 *     responses:
 *       200:
 *         description: User banned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Banned user successfully
 *                 name:
 *                   type: string
 *                   description: Username of banned user
 *       400:
 *         description: Cannot ban yourself or user already banned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     cannot_ban_self:
 *                       value: Cannot ban yourself
 *                     already_banned:
 *                       value: User has been banned
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified or insufficient permissions
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   delete:
 *     summary: Unban user
 *     description: Remove ban from a user (admin/moderator only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: banned_user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to unban (use un_banned_user_id in path)
 *     responses:
 *       200:
 *         description: User unbanned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Un banned user successfully
 *                 usernameUnBanUser:
 *                   type: string
 *                   description: Username of unbanned user
 *       400:
 *         description: Cannot unban yourself or user not banned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     cannot_unban_self:
 *                       value: Cannot un ban yourself
 *                     not_banned:
 *                       value: User has been un banned
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified or insufficient permissions
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
