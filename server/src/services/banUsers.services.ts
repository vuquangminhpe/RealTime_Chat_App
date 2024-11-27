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

    return true
  }
}
const banUserServices = new BanUserServices()
export default banUserServices
