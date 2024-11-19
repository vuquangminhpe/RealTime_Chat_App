import express from 'express'
import { envConfig } from './constants/config'
import { createServer } from 'http'
import { usersRouter } from './routes/users.routes'

const app = express()
const port = envConfig.port || 3000
const httpServer = createServer(app)
app.use('/users', usersRouter)
app.use(express.json())

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
