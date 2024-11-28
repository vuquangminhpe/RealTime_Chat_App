import express from 'express'
import { envConfig } from './constants/config'
import { createServer } from 'http'
import { usersRouter } from './routes/users.routes'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { makeFriendsRouter } from './routes/makeFriend.routes'
import { banUsersRouter } from './routes/banUsers.routes'
import { initFolderImage, initFolderVideo, initFolderVideoHls } from './utils/file'

const app = express()
app.use(express.json())
const port = envConfig.port || 3000
const httpServer = createServer(app)
app.use('/users', usersRouter)
app.use('/make_friends', makeFriendsRouter)
app.use('/ban_users', banUsersRouter)

initFolderImage()
initFolderVideo()
initFolderVideoHls()
app.use(defaultErrorHandler)
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
