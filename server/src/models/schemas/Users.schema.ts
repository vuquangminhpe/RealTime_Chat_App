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
  forgot_password_token: string
  created_at?: Date
  updated_at?: Date
  verify?: UserVerifyStatus
  avatar?: string
  bio?: string
  location?: string
  website?: string
}

class User {
  _id: ObjectId
  email: string
  username: string
  password: string
  email_verify_token: string
  forgot_password_token: string
  created_at?: Date
  updated_at?: Date
  verify?: UserVerifyStatus
  avatar?: string
  bio?: string
  location?: string
  website?: string

  constructor({
    _id,
    email,
    username,
    password,
    email_verify_token,
    forgot_password_token,
    created_at,
    updated_at,
    verify,
    avatar,
    bio,
    location,
    website
  }: UserType) {
    const date = new Date()
    this._id = _id
    this.email = email
    this.username = username
    this.password = password
    this.email_verify_token = email_verify_token
    this.forgot_password_token = forgot_password_token
    this.created_at = created_at || date
    this.updated_at = updated_at || date
    this.verify = verify || UserVerifyStatus.Unverified
    this.avatar = avatar
    this.bio = bio
    this.location = location
    this.website = website
  }
}

export default User
