import { MongoClient, Db, Collection } from 'mongodb'
import { envConfig } from '~/constants/config'
import MakeFriend from '~/models/schemas/makeFriends.schema'
import RefreshToken from '~/models/schemas/refreshToken.schema'
import User from '~/models/schemas/users.schema'

const uri = `mongodb+srv://${envConfig.db_username}:${envConfig.db_password}@minhdevmongo.hzvnp.mongodb.net/?retryWrites=true&w=majority&appName=minhdevMongo`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(envConfig.db_name)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)

      return error
    }
  }

  get users(): Collection<User> {
    return this.db.collection(envConfig.usersCollection)
  }
  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(envConfig.refreshCollection)
  }
  get makeFriend(): Collection<MakeFriend> {
    return this.db.collection(envConfig.makeFriendCollection)
  }
}

const databaseService = new DatabaseService()

export default databaseService
