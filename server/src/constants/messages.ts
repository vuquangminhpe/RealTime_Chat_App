export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation errors',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_CONTAIN_IS_STRING: 'Name must be contain is string',
  NAME_MUST_BE_CONTAIN_5_TO_60_CHARACTER: 'Name must be contain 5 to 60 character',
  USERNAME_IS_ALREADY_EXISTS: 'Username is already exists',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_CONTAIN_IS_STRING: 'Password must be contain is string',
  PASSWORD_MUST_BE_CONTAIN_5_TO_60_CHARACTER: 'Password must be contain 5 to 60 character',
  PASSWORD_MUST_BE_AT_LEAST_1_LETTER_1_NUMBER_AND_1_SPECIAL_CHARACTERS:
    'Password must be at least 1 letter 1 number and 1 special character',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_CONTAIN_IS_STRING: 'Confirm password must be contain is string',
  CONFIRM_PASSWORD_MUST_BE_CONTAIN_5_TO_60_CHARACTER: 'Confirm password must be contain 5 to 60 character',
  CONFIRM_PASSWORD_MUST_BE_AT_LEAST_1_LETTER_1_NUMBER_AND_1_SPECIAL_CHARACTERS:
    'Confirm password must be at least 1 letter 1 number and 1 special character',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_PASSWORD: 'Confirm password is the same password',
  INCORRECT_EMAIL_FORMAT: 'Incorrect email format',
  EMAIL_IS_ALREADY_EXISTS: 'Email is already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  REGISTER_SUCCESSFULLY: 'Register successfully',
  USER_NOT_FOUND: 'User not found',
  LOGIN_SUCCESSFULLY: 'Login successfully',
  ACCESS_TOKEN_REQUIRED: 'Access token required',
  ACCESS_TOKEN_INVALID: 'Access token invalid',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_VALID: 'Refresh token is valid',
  LOGOUT_SUCCESSFULLY: 'Logout successfully',
  REFRESH_TOKEN_SUCCESSFULLY: 'Refresh token successfully',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  VERIFY_EMAIL_TOKEN_SUCCESSFULLY: 'Verify email token successfully',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  GET_RECENT_EMAIL_VERIFY_TOKEN_SUCCESSFULLY: 'Get recent email verify token successfully',
  FORGOT_PASSWORD_SUCCESSFULLY: 'Forgot password successfully',
  PLEASE_CHECK_YOUR_EMAIL_TO_RESET_PASSWORD: 'Please check your email to reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password is required',
  FORGOT_PASSWORD_TOKEN_IS_INVALID: 'Forgot password token is valid',
  VERIFY_FORGOT_PASSWORD_SUCCESSFULLY: 'Verify password successfully',
  RESET_PASSWORD_SUCCESSFULLY: 'Reset password successfully',
  USER_NOT_VERIFIED: 'User not verified',
  GET_MY_PROFILE_SUCCESSFULLY: 'Get my profile successfully',
  USERNAME_IS_REQUIRED: 'Username is required',
  USERNAME_MUST_BE_CONTAIN_IS_STRING: 'Username must be contain is string',
  USERNAME_MUST_BE_CONTAIN_5_TO_60_CHARACTER: 'Username must be contain 5 to 60 character',
  USERNAME_ALREADY_EXISTS: 'Username is already exists',
  BIO_MUST_BE_CONTAIN_IS_STRING: 'BIO must be contain is string',
  BIO_MUST_BE_CONTAIN_5_TO_500_CHARACTER: 'Bio must be contain 5 to 500 character',
  LOCATION_MUST_BE_CONTAIN_IS_STRING: 'Location must be contain is string',
  LOCATION_MUST_BE_CONTAIN_5_TO_100_CHARACTER: 'Location must be contain 5 to 100 character',
  WEBSITE_MUST_BE_VALID_URL: 'Website must be valid URL',
  WEBSITE_MUST_BE_CONTAIN_5_TO_255_CHARACTER: 'Website must be contain 5 to 255 character',
  UPDATE_MY_PROFILE_SUCCESSFULLY: 'Update my profile successfully',
  INVALID_USER_ID: 'Invalid user ID',
  GET_USER_DETAILS_SUCCESSFULLY: 'Get user details successfully',
  USER_BANNED_CANT_NOT_GET_DATA: 'User banned cant not get data',
  DATE_OF_BIRTH_IS_REQUIRED: 'Date of birth is required',
  DATE_OF_BIRTH_MUST_BE_IN_ISO_8601_FORMAT: 'Date of birth must be in ISO 8601 format',
  YOU_ARE_NOT_ELIGIBLE_FOR_REGISTER: 'You are not eligible for registration',
  USER_HAS_BEEN_BANNED_NO_GET_PROFILE: 'User has been banned no get profile',
  UPLOAD_SUCCESS: 'Upload success',
  GET_VIDEO_STATUS_SUCCESS: 'Get video status success',
  SENDER_ID_MUST_BE_CONTAIN_IS_STRING: 'Sender ID must be contain is string'
}

export const FRIENDS_SHIP_MESSAGES = {
  FRIEND_NOT_FOUND: 'Friend not found',
  ALREADY_FRIEND: 'Already friend',
  FRIEND_ADDED_SUCCESSFULLY: 'Friend add successfully',
  NOT_FRIEND: 'Not friend',
  REMOVED_FRIEND_SUCCESSFULLY: 'Removed friend successfully',
  CANNOT_ADD_YOURSELF: 'Cannot add yourself',
  USER_IS_BANNED: 'User is banned',
  FRIEND_REQUEST_ACCEPTED: 'Friend request accepted',
  YOU_HAVE_BEEN_CONNECTED_TO_THIS_USER: 'You have been connected to this user',
  YOU_HAVE_BEEN_REJECT_TO_THIS_USER: 'You have been reject to this user',
  YOU_HAVE_BEEN_BLOCKED_TO_THIS_USER: 'You have been blocked to this user',
  FRIEND_REQUEST_ACCEPTED_SUCCESSFULLY: 'Friend request accepted successfully',
  FRIEND_REQUEST_REJECTED_SUCCESSFULLY: 'Friend request rejected successfully',
  GET_FRIEND_REQUESTS_SUCCESSFULLY: 'Get friend requests successfully',
  GET_ALL_FRIENDS_SUCCESSFULLY: 'Get all friends successfully',
  GET_FRIEND_SUGGESTIONS_SUCCESSFULLY: 'Get friend suggestions successfully',
  SEARCH_IS_REQUIRED: 'Search is required',
  GET_FRIENDS_SUCCESSFULLY: 'Get friends successfully',
  CANCEL_FRIEND_REQUEST_SUCCESSFULLY: 'Cancel friend request successfully',
  YOU_CAN_NOT_CANCEL_TO_THIS_USER: 'You can not cancel to this user'
}

export const BANNED_MESSAGES = {
  BANNED_USER_ID_REQUIRED: 'Banned user ID is required',
  CANNOT_BAN_YOURSELF: 'Cannot ban yourself',
  BANNED_USER_SUCCESSFULLY: 'Banned user successfully',
  UN_BANNED_USER_ID_REQUIRED: 'Un banned user ID is required',
  UN_BANNED_USER_SUCCESSFULLY: 'Un banned user successfully',
  USER_HAS_BEEN_BANNED: 'User has been banned',
  USER_HAS_BEEN_UN_BANNED: 'User has been un banned',
  CANNOT_UN_BAN_YOURSELF: 'Cannot un ban yourself'
}

export const CONVERSATIONS_MESSAGES = {
  GET_CONVERSATION_SUCCESSFULLY: 'Get conversation successfully',
  NO_CONVERSATION: 'No conversation',
  GET_ALL_CONVERSATION_SUCCESSFULLY: 'Get all conversation successfully',
  TYPE_MUST_BE_PRIVATE_OR_GROUP: 'Type must be private or group'
}

export const STORIES_MESSAGES = {
  ADD_STORY_SUCCESS: 'Add story successfully',
  GET_STORIES_SUCCESS: 'Get stories successfully',
  DELETE_STORY_SUCCESS: 'Delete story successfully',
  GET_USER_STORIES_SUCCESS: 'Get user stories successfully',
  STORY_NOT_FOUND: 'Story not found',
  NOT_YOUR_STORY: 'You can only delete your own stories',
  CONTENT_IS_REQUIRED: 'Content is required',
  INVALID_CONTENT_TYPE: 'Invalid content type',
  TEXT_MUST_BE_STRING: 'Text must be a string',
  TEXT_TOO_LONG: 'Text is too long (max 500 characters)',
  STORY_ID_REQUIRED: 'Story ID is required'
}

export const REACTIONS_MESSAGES = {
  ADD_REACTION_SUCCESS: 'Add reaction successfully',
  REMOVE_REACTION_SUCCESS: 'Remove reaction successfully',
  GET_REACTIONS_SUCCESS: 'Get reactions successfully',
  GET_USER_REACTIONS_SUCCESS: 'Get user reactions successfully',
  REACTION_NOT_FOUND: 'Reaction not found',
  TARGET_ID_REQUIRED: 'Target ID is required',
  TARGET_ID_MUST_BE_STRING: 'Target ID must be a string',
  TARGET_TYPE_REQUIRED: 'Target type is required',
  INVALID_TARGET_TYPE: 'Invalid target type',
  REACTION_TYPE_REQUIRED: 'Reaction type is required',
  INVALID_REACTION_TYPE: 'Invalid reaction type'
}

export const MESSAGES_MESSAGES = {
  SEND_MESSAGE_SUCCESS: 'Send message successfully',
  GET_MESSAGES_SUCCESS: 'Get messages successfully',
  EDIT_MESSAGE_SUCCESS: 'Edit message successfully',
  DELETE_MESSAGE_SUCCESS: 'Delete message successfully',
  MARK_READ_SUCCESS: 'Mark messages as read successfully',
  SEARCH_MESSAGES_SUCCESS: 'Search messages successfully',
  MESSAGE_NOT_FOUND: 'Message not found',
  NOT_YOUR_MESSAGE: 'You can only edit/delete your own messages',
  NOT_CONVERSATION_PARTICIPANT: 'You are not a participant in this conversation',
  CONVERSATION_ID_REQUIRED: 'Conversation ID is required',
  CONTENT_IS_REQUIRED: 'Content is required',
  MESSAGE_ID_REQUIRED: 'Message ID is required',
  SEARCH_TERM_REQUIRED: 'Search term is required'
}

export const LIKES_MESSAGES = {
  LIKE_SUCCESS: 'Like successfully',
  UNLIKE_SUCCESS: 'Unlike successfully',
  GET_LIKES_SUCCESS: 'Get likes successfully',
  GET_USER_LIKES_SUCCESS: 'Get user likes successfully',
  CHECK_LIKE_STATUS_SUCCESS: 'Check like status successfully',
  ALREADY_LIKED: 'Already liked this target',
  LIKE_NOT_FOUND: 'Like not found',
  TARGET_NOT_FOUND: 'Target not found',
  TARGET_ID_REQUIRED: 'Target ID is required',
  TARGET_ID_MUST_BE_STRING: 'Target ID must be a string',
  TARGET_TYPE_REQUIRED: 'Target type is required',
  INVALID_TARGET_TYPE: 'Invalid target type'
}

export const GROUP_CHAT_MESSAGES = {
  CREATE_GROUP_SUCCESS: 'Create group successfully',
  ADD_MEMBER_SUCCESS: 'Add member successfully',
  REMOVE_MEMBER_SUCCESS: 'Remove member successfully',
  LEAVE_GROUP_SUCCESS: 'Leave group successfully',
  UPDATE_GROUP_SUCCESS: 'Update group successfully',
  GET_GROUP_INFO_SUCCESS: 'Get group info successfully',
  GET_GROUP_MEMBERS_SUCCESS: 'Get group members successfully',
  GET_USER_GROUPS_SUCCESS: 'Get user groups successfully',
  MAKE_ADMIN_SUCCESS: 'Make admin successfully',
  REMOVE_ADMIN_SUCCESS: 'Remove admin successfully',
  GROUP_NOT_FOUND: 'Group not found',
  NOT_GROUP_MEMBER: 'You are not a member of this group',
  MEMBER_NOT_FOUND: 'Member not found in this group',
  MEMBER_ALREADY_IN_GROUP: 'Member is already in this group',
  CANNOT_REMOVE_OWNER: 'Cannot remove group owner',
  OWNER_CANNOT_LEAVE: 'Owner cannot leave group, transfer ownership first',
  ADMIN_PERMISSION_REQUIRED: 'Admin permission required',
  OWNER_PERMISSION_REQUIRED: 'Owner permission required',
  ALREADY_ADMIN: 'User is already an admin',
  GROUP_NAME_REQUIRED: 'Group name is required',
  MEMBER_IDS_REQUIRED: 'Member IDs are required'
}

export const NOTIFICATIONS_MESSAGES = {
  GET_NOTIFICATIONS_SUCCESS: 'Get notifications successfully',
  MARK_READ_SUCCESS: 'Mark notification as read successfully',
  MARK_ALL_READ_SUCCESS: 'Mark all notifications as read successfully',
  DELETE_NOTIFICATION_SUCCESS: 'Delete notification successfully',
  GET_UNREAD_COUNT_SUCCESS: 'Get unread count successfully',
  CLEAR_ALL_SUCCESS: 'Clear all notifications successfully',
  NOTIFICATION_NOT_FOUND: 'Notification not found',
  NOTIFICATION_ID_REQUIRED: 'Notification ID is required',
  INVALID_NOTIFICATION_ID: 'Invalid notification ID'
}
export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Not found',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  BAD_REQUEST: 'Bad request',
  CONFLICT: 'Conflict',
  SERVICE_UNAVAILABLE: 'Service unavailable'
}
