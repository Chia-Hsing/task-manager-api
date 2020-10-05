const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Email is invalid')
                }
            },
        },
        password: {
            type: String,
            trim: true,
            required: true,
            minlength: 7,
            validate(value) {
                if (value.toLowerCase().includes('password')) {
                    throw new Error('Password can not be password!')
                }
            },
        },
        age: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0) {
                    throw new Error('Age must be a positive number.')
                }
            },
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        chia: {
            type: Buffer,
        },
    },
    {
        timestamps: true,
    }
)

userSchema.virtual('userTasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner',
})
// userSchema.virtual 不會將資料存進 database 中，只是單純連結兩個 model 之間的關係。
// Task (model:Task 裡面的 owner (foreignField)) 就是 User (model:User 裡面的 _id(localField)))
// the tasks live in a separate collection so we use userSchema.virtual

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.chia

    return userObject
}
// 每一次呼叫 res.send()時，express 會在背後將 pass 進去的 Object 用JSON.stringify 轉成 json 格式。mongoose 提供 toJSON 這個method ，會在每次 res.send() 呼叫 JSON.stringify 時被呼叫。所以我們就可以先進到 user instance 的 Object 內做操作，再將結果 return 出來。toObject()就是將 json 格式先轉成 Object。
// Mongoose supports two Schema options to transform Objects after querying MongoDb: toObject and toJSON.

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}
// userSchema.methods can set a method inside the user instance.
// this is equal to the instance itself.

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login!')
    }

    const isMatch = await bcryptjs.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login!')
    }

    return user
}
// userSchema.statics can set a method inside the User model.

userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcryptjs.hash(user.password, 8)
    }

    next()
})
// mongoose middleware containing two methods, pre and post.

userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
