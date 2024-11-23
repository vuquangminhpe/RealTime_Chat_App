/* eslint-disable prettier/prettier */
import { ObjectId } from 'mongodb'

enum UserVerifyStatus {
  Unverified, // chưa xác thực
  Verified, // đã xác thực email
  Banned // bị khóa
}

export interface UserType {
  _id: ObjectId
  email: string
  username: string
  password: string
  email_verify_token: string
  created_at?: Date
  updated_at?: Date
  verify?: UserVerifyStatus
  avatar?: string
}

class User {
  _id: ObjectId
  email: string
  username: string
  password: string
  email_verify_token: string
  created_at?: Date
  updated_at?: Date
  verify?: UserVerifyStatus
  avatar?: string

  constructor({
    _id,
    email,
    username,
    password,
    email_verify_token,
    created_at,
    updated_at,
    verify,
    avatar
  }: UserType) {
    const date = new Date()
    this._id = _id
    this.email = email
    this.username = username
    this.password = password
    this.email_verify_token = email_verify_token
    this.created_at = created_at || date
    this.updated_at = updated_at || date
    this.verify = verify || UserVerifyStatus.Unverified
    this.avatar = avatar
  }
}

export default User
