import { ObjectId } from 'mongodb'
import { EncodingStatus } from '~/constants/enum'
interface VideoStatusType {
  _id?: ObjectId
  name: string
  status: EncodingStatus
  message?: string
  created_at?: Date
  update_at?: Date
}
export default class VideoStatus {
  _id?: ObjectId
  name: string
  status: EncodingStatus
  message?: string
  created_at?: Date
  update_at?: Date
  constructor({ name, status, _id, created_at, update_at, message }: VideoStatusType) {
    const date = new Date()
    this._id = _id
    this.name = name
    this.status = status
    this.message = message || ''
    this.created_at = created_at || date
    this.update_at = update_at || date
  }
}
