import { faker } from '@faker-js/faker'
import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import { TweetRequestBody } from '~/models/request/Tweet.request'
import { RegisterReqBody } from '~/models/request/User.request'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { hashPassword } from './crypto'
import Follower from '~/models/schemas/Follower.schema'
import tweetsService from '~/services/tweets.services'

const PASSWORD = 'Minh9972'
const MYID = new ObjectId('672ce09b6c4e5340d598c42c')

const USER_COUNT = 2

const createRandomUser = () => {
  const user: RegisterReqBody & { confirm_password: string } = {
    username: faker.internet.displayName(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirm_password: PASSWORD,
    date_of_birth: faker.date.past().toISOString()
  }
  return user
}

const createRandomTweet = () => {
  const tweet: TweetRequestBody = {
    type: TweetType.Tweet,
    audience: TweetAudience.Everyone,
    content: faker.lorem.paragraph({
      min: 10,
      max: 160
    }),
    hashtags: [],
    medias: [],
    mentions: [],
    parent_id: null
  }
  return tweet
}

const users: RegisterReqBody[] = faker.helpers.multiple(createRandomUser, {
  count: USER_COUNT
})

const insertMultipleUsers = async (users: RegisterReqBody[]) => {
  console.log('Creating users....')

  const result = await Promise.all(
    users.map(async (user) => {
      const user_id = new ObjectId()
      const result = await databaseService.users.insertOne(
        new User({
          ...user,
          username: `user${user_id.toString()}`,
          password: hashPassword(user.password),
          date_of_birth: new Date(user.date_of_birth),
          verify: UserVerifyStatus.Verified
        })
      )
      return result.insertedId.toString() as any
    })
  )
  return result
}

const followMultipleUsers = async (user_id: ObjectId, followed_user_ids: ObjectId[]) => {
  const result = await Promise.all(
    followed_user_ids.map((followed_user_id) => {
      databaseService.followers.insertOne(
        new Follower({
          user_id,
          followed_user_id: new ObjectId(followed_user_id)
        })
      )
    })
  )
  console.log(`Followed ${result.length} users`)
}

const insertMultipleTweets = async (userIds: ObjectId[]) => {
  let count = 0
  const result = await Promise.all(
    userIds.map(async (userId) => {
      const tweetIds = await Promise.all([
        tweetsService.createTweet(userId.toString(), createRandomTweet()),
        tweetsService.createTweet(userId.toString(), createRandomTweet())
      ])
      await databaseService.users.updateOne({ _id: userId }, { $push: { tweets: { $each: tweetIds } } })
      count += tweetIds.length
    })
  )
  return result
}

insertMultipleUsers(users).then((ids) => {
  followMultipleUsers(new ObjectId(MYID), ids)
  insertMultipleTweets(ids)
})
