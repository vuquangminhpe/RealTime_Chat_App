import { MongoClient, Db, Collection } from 'mongodb'
import { envConfig } from '~/constants/config'
import BanUser from '~/models/schemas/banUser.schema'
import Conversations from '~/models/schemas/conversation.schema'
import FriendsShip from '~/models/schemas/friendsShip.schema'
import Message from '~/models/schemas/message.chema'
import Reactions from '~/models/schemas/reactions.schema'
import RefreshToken from '~/models/schemas/refreshToken.schema'
import Stories from '~/models/schemas/stories.schema'
import User from '~/models/schemas/Users.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'

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
  get friendShip(): Collection<FriendsShip> {
    return this.db.collection(envConfig.friendsShipCollection)
  }
  get bannedUsers(): Collection<BanUser> {
    return this.db.collection(envConfig.banUserCollection)
  }
  get stories(): Collection<Stories> {
    return this.db.collection(envConfig.storiesCollection)
  }
  get reactions(): Collection<Reactions> {
    return this.db.collection(envConfig.reactionsCollection)
  }
  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(envConfig.VideoStatusCollection)
  }
  get conversations(): Collection<Conversations> {
    return this.db.collection(envConfig.conversationsCollection)
  }
  get messages(): Collection<Message> {
    return this.db.collection(envConfig.messagesCollection)
  }
}

const databaseService = new DatabaseService()

export default databaseService
