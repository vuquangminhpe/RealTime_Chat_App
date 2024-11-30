export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum StoriesDataType {
  Image,
  Videos
}

export enum ReactionStatus {
  like,
  love,
  haha,
  wow,
  sad,
  angry
}

export enum MediaType {
  Image,
  Video,
  HLS
}
export enum MediaTypeQuery {
  Image = 'image',
  Video = 'video'
}
export enum EncodingStatus {
  Pending, //hàng đợi
  Processing, //Đang encode
  Success, // Encode thành công
  Failed // Encode thất bại
}
export enum ConversationsStatus {
  private,
  group
}

export enum FriendsShipStatus {
  accepted,
  pending,
  blocked,
  rejected
}
