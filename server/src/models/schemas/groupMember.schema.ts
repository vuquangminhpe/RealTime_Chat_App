import { ObjectId } from 'mongodb'

export enum GroupMemberRole {
  Owner = 'owner',
  Admin = 'admin',
  Member = 'member'
}

export enum GroupMemberStatus {
  Active = 'active',
  Left = 'left',
  Removed = 'removed'
}

interface GroupMemberType {
  _id?: ObjectId
  group_id: ObjectId
  user_id: ObjectId
  role: GroupMemberRole
  status: GroupMemberStatus
  joined_at?: Date
  left_at?: Date
  added_by?: ObjectId
}

export default class GroupMember {
  _id?: ObjectId
  group_id: ObjectId
  user_id: ObjectId
  role: GroupMemberRole
  status: GroupMemberStatus
  joined_at?: Date
  left_at?: Date
  added_by?: ObjectId

  constructor({ _id, group_id, user_id, role, status, joined_at, left_at, added_by }: GroupMemberType) {
    this._id = _id
    this.group_id = group_id
    this.user_id = user_id
    this.role = role || GroupMemberRole.Member
    this.status = status || GroupMemberStatus.Active
    this.joined_at = joined_at || new Date()
    this.left_at = left_at
    this.added_by = added_by
  }
}
