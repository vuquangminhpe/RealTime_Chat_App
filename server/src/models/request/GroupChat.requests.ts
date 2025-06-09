export interface CreateGroupReqBody {
  name: string
  description?: string
  member_ids: string[]
  avatar?: string
}

export interface AddMemberReqBody {
  member_ids: string[]
}

export interface RemoveMemberReqBody {
  member_id: string
}

export interface UpdateGroupReqBody {
  name?: string
  description?: string
  avatar?: string
}

export interface GetGroupMembersReqQuery {
  limit?: number
  page?: number
}

export interface TransferOwnershipReqBody {
  new_owner_id: string
}
