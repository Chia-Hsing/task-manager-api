const express = require('express')
const userRouter = require('./router/user')
const taskRouter = require('./router/task')
require('./db/mongoose.js')

const app = express()
// eslint-disable-next-line no-undef
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
