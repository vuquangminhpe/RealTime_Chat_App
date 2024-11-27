import BanUser from '~/models/schemas/banUser.schema'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'

class BanUserServices {
  async banUser(banned_user_id: string, user_id: string) {
    const _id = new ObjectId()
    await databaseService.bannedUsers.insertOne(
      new BanUser({
        _id,
        user_id: new ObjectId(user_id),
        banned_user_id: new ObjectId(banned_user_id)
      })
    )
    const banned_user = await databaseService.users.findOne({
      _id: new ObjectId(banned_user_id)
    })
    return banned_user
  }
  async unBanUser(un_banned_user_id: string) {
    await databaseService.bannedUsers.findOneAndDelete({
      banned_user_id: new ObjectId(un_banned_user_id)
    })
    const banned_user = await databaseService.users.findOne({ _id: new ObjectId(un_banned_user_id) })
    return banned_user?.username
  }
}
const banUserServices = new BanUserServices()
export default banUserServices
