const { MongoClient, ObjectID } = require('mongodb')
const connectionURL = 'mongodb://127.0.0.1/27017'
const dataName = 'task-manager'

const id = new ObjectID()
// console.log(id)
// console.log(id.getTimestamp())
// console.log(id.id)
// console.log(id.toHexString())

MongoClient.connect(connectionURL, { useUnifiedTopology: true }, (error, client) => {
    if (error) {
        return console.log('Unable to connect to database!')
    }

    const db = client.db(dataName)
    db.collection('users').insertOne({ _id: id, name: 'Steve', age: 32 }, (error, result) => {
        if (error) {
            return console.log('Unable to insert user.')
        }

        console.log(result.ops)
    })

    // db.collection('users').findOne({ _id: ObjectID('5f58fbbca97add0c3d993a9c'), name: 'Ryan' }, (error, user) => {
    //     if (error) {
    //         return console.log('Unable to fetch')
    //     }

    //     console.log(user)
    // })

    // db.collection('users')
    //     .find({ name: 'Ryan' })
    //     .toArray((error, users) => {
    //         console.log(users)
    //     })

    // db.collection('users')
    //     .find({ name: 'Ryan' })
    //     .count((error, count) => {
    //         console.log(count)
    //     })

    // db.collection('users')
    //     .updateOne(
    //         { _id: new ObjectID('5f58e8f4d565a80a715238ee') },
    //         {
    //             $set: { name: 'Max' },
    //             $inc: {
    //                 age: 1,
    //             },
    //         }
    //     )
    //     .then(result => {
    //         console.log(result)
    //     })
    //     .catch(error => {
    //         console.log(error)
    //     })
})
