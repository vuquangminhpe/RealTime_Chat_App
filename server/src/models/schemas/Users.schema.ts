import { ObjectId } from 'mongodb'

enum UserVerifyStatus {
  Unverified, // chưa xác thực
  Verified, // đã xác thực email
  Banned // bị khóa
}
