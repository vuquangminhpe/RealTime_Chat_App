import { ObjectId } from 'mongodb'
import { ConversationsStatus } from '~/constants/enum'
import { CreateGroupReqBody, UpdateGroupReqBody } from '~/models/request/GroupChat.requests'
import Conversations from '~/models/schemas/conversation.schema'
import GroupMember, { GroupMemberRole, GroupMemberStatus } from '~/models/schemas/groupMember.schema'
import databaseService from './database.services'
import { ErrorWithStatus } from '~/models/Errors'
import { GROUP_CHAT_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'

class GroupChatServices {
  async createGroup(creator_id: string, body: CreateGroupReqBody) {
    const { name, description, member_ids, avatar } = body

    // Verify all members exist
    const members = await databaseService.users
      .find({ _id: { $in: member_ids.map((id) => new ObjectId(id)) } })
      .toArray()

    if (members.length !== member_ids.length) {
      throw new ErrorWithStatus({
        messages: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Create conversation
    const conversationId = new ObjectId()
    await databaseService.conversations.insertOne(
      new Conversations({
        _id: conversationId,
        sender_id: new ObjectId(creator_id), // Group owner
        receiver_id: member_ids.map((id: string) => new ObjectId(id)),
        type: ConversationsStatus.group,
        content: `${name} group created`,
        group_name: name,
        group_description: description,
        group_avatar: avatar
      })
    )

    // Add creator as owner
    await databaseService.groupMembers.insertOne(
      new GroupMember({
        _id: new ObjectId(),
        group_id: conversationId,
        user_id: new ObjectId(creator_id),
        role: GroupMemberRole.Owner,
        status: GroupMemberStatus.Active
      })
    )

    // Add members
    const memberDocuments = member_ids.map(
      (member_id: string) =>
        new GroupMember({
          _id: new ObjectId(),
          group_id: conversationId,
          user_id: new ObjectId(member_id as string),
          role: GroupMemberRole.Member,
          status: GroupMemberStatus.Active,
          added_by: new ObjectId(creator_id)
        })
    )

    await databaseService.groupMembers.insertMany(memberDocuments)

    // Get created group with member info
    const result = await this.getGroupInfo(creator_id, conversationId.toString())
    return result
  }

  async addMember(admin_id: string, group_id: string, member_ids: string[]) {
    // Verify admin permission
    await this.verifyAdminPermission(admin_id, group_id)

    // Verify new members exist
    const members = await databaseService.users
      .find({ _id: { $in: member_ids.map((id) => new ObjectId(id)) } })
      .toArray()

    if (members.length !== member_ids.length) {
      throw new ErrorWithStatus({
        messages: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Check if members are already in group
    const existingMembers = await databaseService.groupMembers
      .find({
        group_id: new ObjectId(group_id),
        user_id: { $in: member_ids.map((id) => new ObjectId(id)) },
        status: GroupMemberStatus.Active
      })
      .toArray()

    if (existingMembers.length > 0) {
      throw new ErrorWithStatus({
        messages: GROUP_CHAT_MESSAGES.MEMBER_ALREADY_IN_GROUP,
        status: HTTP_STATUS.CONFLICT
      })
    }

    // Add new members
    const memberDocuments = member_ids.map(
      (member_id) =>
        new GroupMember({
          _id: new ObjectId(),
          group_id: new ObjectId(group_id),
          user_id: new ObjectId(member_id),
          role: GroupMemberRole.Member,
          status: GroupMemberStatus.Active,
          added_by: new ObjectId(admin_id)
        })
    )

    await databaseService.groupMembers.insertMany(memberDocuments)

    // Update conversation receiver_ids
    const allActiveMembers = await databaseService.groupMembers
      .find({
        group_id: new ObjectId(group_id),
        status: GroupMemberStatus.Active
      })
      .toArray()

    await databaseService.conversations.updateOne(
      { _id: new ObjectId(group_id) },
      {
        $set: {
          receiver_id: allActiveMembers.map((member) => member.user_id),
          update_at: new Date()
        }
      }
    )

    return { added_members: member_ids.length }
  }

  async removeMember(admin_id: string, group_id: string, member_id: string) {
    // Verify admin permission
    await this.verifyAdminPermission(admin_id, group_id)

    const member = await databaseService.groupMembers.findOne({
      group_id: new ObjectId(group_id),
      user_id: new ObjectId(member_id),
      status: GroupMemberStatus.Active
    })

    if (!member) {
      throw new ErrorWithStatus({
        messages: GROUP_CHAT_MESSAGES.MEMBER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Can't remove owner
    if (member.role === GroupMemberRole.Owner) {
      throw new ErrorWithStatus({
        messages: GROUP_CHAT_MESSAGES.CANNOT_REMOVE_OWNER,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    // Update member status
    await databaseService.groupMembers.updateOne(
      {
        group_id: new ObjectId(group_id),
        user_id: new ObjectId(member_id)
      },
      {
        $set: {
          status: GroupMemberStatus.Removed,
          left_at: new Date()
        }
      }
    )

    // Update conversation receiver_ids
    await this.updateGroupReceiverIds(group_id)
  }

  async leaveGroup(user_id: string, group_id: string) {
    const member = await databaseService.groupMembers.findOne({
      group_id: new ObjectId(group_id),
      user_id: new ObjectId(user_id),
      status: GroupMemberStatus.Active
    })

    if (!member) {
      throw new ErrorWithStatus({
        messages: GROUP_CHAT_MESSAGES.NOT_GROUP_MEMBER,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    // Owner can't leave, must transfer ownership first
    if (member.role === GroupMemberRole.Owner) {
      throw new ErrorWithStatus({
        messages: GROUP_CHAT_MESSAGES.OWNER_CANNOT_LEAVE,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    // Update member status
    await databaseService.groupMembers.updateOne(
      {
        group_id: new ObjectId(group_id),
        user_id: new ObjectId(user_id)
      },
      {
        $set: {
          status: GroupMemberStatus.Left,
          left_at: new Date()
        }
      }
    )

    // Update conversation receiver_ids
    await this.updateGroupReceiverIds(group_id)
  }

  async updateGroup(admin_id: string, group_id: string, body: UpdateGroupReqBody) {
    // Verify admin permission
    await this.verifyAdminPermission(admin_id, group_id)

    const updateData: any = {}
    if (body.name) updateData.group_name = body.name
    if (body.description) updateData.group_description = body.description
    if (body.avatar) updateData.group_avatar = body.avatar
    updateData.update_at = new Date()

    const result = await databaseService.conversations.findOneAndUpdate(
      { _id: new ObjectId(group_id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    return result
  }

  async getGroupInfo(user_id: string, group_id: string) {
    // Verify user is member
    await this.verifyMembership(user_id, group_id)

    const group = await databaseService.conversations.findOne({
      _id: new ObjectId(group_id),
      type: ConversationsStatus.group
    })

    if (!group) {
      throw new ErrorWithStatus({
        messages: GROUP_CHAT_MESSAGES.GROUP_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Get member count
    const memberCount = await databaseService.groupMembers.countDocuments({
      group_id: new ObjectId(group_id),
      status: GroupMemberStatus.Active
    })

    // Get user's role in group
    const userMembership = await databaseService.groupMembers.findOne({
      group_id: new ObjectId(group_id),
      user_id: new ObjectId(user_id),
      status: GroupMemberStatus.Active
    })

    return {
      ...group,
      member_count: memberCount,
      user_role: userMembership?.role
    }
  }

  async getGroupMembers(user_id: string, group_id: string, limit: number, page: number) {
    // Verify user is member
    await this.verifyMembership(user_id, group_id)

    const members = await databaseService.groupMembers
      .find({
        group_id: new ObjectId(group_id),
        status: GroupMemberStatus.Active
      })
      .sort({ role: 1, joined_at: 1 }) // Owner/Admins first
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    // Get user info for each member
    const membersWithUserInfo = await Promise.all(
      members.map(async (member) => {
        const user = await databaseService.users.findOne(
          { _id: member.user_id },
          { projection: { username: 1, avatar: 1, bio: 1 } }
        )
        return {
          ...member,
          user
        }
      })
    )

    const total = await databaseService.groupMembers.countDocuments({
      group_id: new ObjectId(group_id),
      status: GroupMemberStatus.Active
    })

    return { members: membersWithUserInfo, total }
  }

  async getUserGroups(user_id: string, limit: number, page: number) {
    const userGroups = await databaseService.groupMembers
      .find({
        user_id: new ObjectId(user_id),
        status: GroupMemberStatus.Active
      })
      .sort({ joined_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    // Get group info for each membership
    const groupsWithInfo = await Promise.all(
      userGroups.map(async (membership) => {
        const group = await databaseService.conversations.findOne({
          _id: membership.group_id
        })

        // Get member count
        const memberCount = await databaseService.groupMembers.countDocuments({
          group_id: membership.group_id,
          status: GroupMemberStatus.Active
        })

        return {
          ...group,
          member_count: memberCount,
          user_role: membership.role,
          joined_at: membership.joined_at
        }
      })
    )

    const total = await databaseService.groupMembers.countDocuments({
      user_id: new ObjectId(user_id),
      status: GroupMemberStatus.Active
    })

    return { groups: groupsWithInfo, total }
  }

  async makeAdmin(owner_id: string, group_id: string, member_id: string) {
    // Verify owner permission
    await this.verifyOwnerPermission(owner_id, group_id)

    const member = await databaseService.groupMembers.findOne({
      group_id: new ObjectId(group_id),
      user_id: new ObjectId(member_id),
      status: GroupMemberStatus.Active
    })

    if (!member) {
      throw new ErrorWithStatus({
        messages: GROUP_CHAT_MESSAGES.MEMBER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (member.role === GroupMemberRole.Admin) {
      throw new ErrorWithStatus({
        messages: GROUP_CHAT_MESSAGES.ALREADY_ADMIN,
        status: HTTP_STATUS.CONFLICT
      })
    }

    await databaseService.groupMembers.updateOne(
      {
        group_id: new ObjectId(group_id),
        user_id: new ObjectId(member_id)
      },
      {
        $set: { role: GroupMemberRole.Admin }
      }
    )
  }

  async removeAdmin(owner_id: string, group_id: string, member_id: string) {
    // Verify owner permission
    await this.verifyOwnerPermission(owner_id, group_id)

    await databaseService.groupMembers.updateOne(
      {
        group_id: new ObjectId(group_id),
        user_id: new ObjectId(member_id)
      },
      {
        $set: { role: GroupMemberRole.Member }
      }
    )
  }

  private async verifyMembership(user_id: string, group_id: string) {
    const member = await databaseService.groupMembers.findOne({
      group_id: new ObjectId(group_id),
      user_id: new ObjectId(user_id),
      status: GroupMemberStatus.Active
    })

    if (!member) {
      throw new ErrorWithStatus({
        messages: GROUP_CHAT_MESSAGES.NOT_GROUP_MEMBER,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    return member
  }

  private async verifyAdminPermission(user_id: string, group_id: string) {
    const member = await this.verifyMembership(user_id, group_id)

    if (member.role !== GroupMemberRole.Admin && member.role !== GroupMemberRole.Owner) {
      throw new ErrorWithStatus({
        messages: GROUP_CHAT_MESSAGES.ADMIN_PERMISSION_REQUIRED,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    return member
  }

  private async verifyOwnerPermission(user_id: string, group_id: string) {
    const member = await this.verifyMembership(user_id, group_id)

    if (member.role !== GroupMemberRole.Owner) {
      throw new ErrorWithStatus({
        messages: GROUP_CHAT_MESSAGES.OWNER_PERMISSION_REQUIRED,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    return member
  }

  private async updateGroupReceiverIds(group_id: string) {
    const activeMembers = await databaseService.groupMembers
      .find({
        group_id: new ObjectId(group_id),
        status: GroupMemberStatus.Active
      })
      .toArray()

    await databaseService.conversations.updateOne(
      { _id: new ObjectId(group_id) },
      {
        $set: {
          receiver_id: activeMembers.map((member) => member.user_id),
          update_at: new Date()
        }
      }
    )
  }
}

const groupChatServices = new GroupChatServices()
export default groupChatServices
