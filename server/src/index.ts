import express from 'express'
import { envConfig } from './constants/config'

const app = express()
const port = envConfig.port || 3000
app.use(express.json())

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
