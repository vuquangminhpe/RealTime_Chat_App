/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *               - confirm_password
 *               - date_of_birth
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email
 *               username:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 50
 *                 description: Username
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 50
 *                 description: Password (must contain at least 1 letter, 1 number, and 1 special character)
 *               confirm_password:
 *                 type: string
 *                 description: Confirm password (must match password)
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: Date of birth (must be 18+ years old)
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Register successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email_verify_token:
 *                       type: string
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /users/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and get access tokens
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       description: JWT access token
 *                     refresh_token:
 *                       type: string
 *                       description: JWT refresh token
 *       404:
 *         description: User not found
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /users/logout:
 *   post:
 *     summary: User logout
 *     description: Logout user and invalidate refresh token
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: Refresh token to invalidate
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /users/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Get new access token using refresh token
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: Valid refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Refresh token successfully
 *                 result:
 *                   type: string
 *                   description: New refresh token
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Get authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get my profile successfully
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   put:
 *     summary: Update user profile
 *     description: Update authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username
 *               avatar:
 *                 type: string
 *                 description: Avatar URL
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *                 description: User bio
 *               location:
 *                 type: string
 *                 maxLength: 100
 *                 description: User location
 *               website:
 *                 type: string
 *                 maxLength: 255
 *                 description: Website URL
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Update my profile successfully
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /users/{username}:
 *   get:
 *     summary: Get user profile by username
 *     description: Get public profile information of a user by username
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username to get profile for
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get user details successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     location:
 *                       type: string
 *                     website:
 *                       type: string
 *       400:
 *         description: User banned or invalid username
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /users/verify-email:
 *   post:
 *     summary: Verify email address
 *     description: Verify user's email address using verification token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email_verify_token
 *             properties:
 *               email_verify_token:
 *                 type: string
 *                 description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verify email token successfully
 *       204:
 *         description: Email already verified
 *       404:
 *         description: User not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /users/resend-verify-email:
 *   post:
 *     summary: Resend email verification
 *     description: Resend email verification token
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get recent email verify token successfully
 *                 result:
 *                   type: string
 *                   description: New email verification token
 *       204:
 *         description: Email already verified
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /users/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Send password reset email to user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forgot password successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     note:
 *                       type: string
 *                       example: Please check your email to reset password
 *                     forgot_password_token:
 *                       type: string
 *       404:
 *         description: User not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /users/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Reset user password using reset token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirm_password
 *               - forgot_password_token
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 50
 *                 description: New password
 *               confirm_password:
 *                 type: string
 *                 description: Confirm new password
 *               forgot_password_token:
 *                 type: string
 *                 description: Password reset token
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reset password successfully
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Invalid reset token
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
