import express from 'express'
import { envConfig } from './constants/config'
import { createServer } from 'http'
import { usersRouter } from './routes/users.routes'
import { defaultErrorHandler } from './middlewares/error.middlewares'

const app = express()
app.use(express.json())
const port = envConfig.port || 3000
const httpServer = createServer(app)
app.use('/users', usersRouter)

app.use(defaultErrorHandler)
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
