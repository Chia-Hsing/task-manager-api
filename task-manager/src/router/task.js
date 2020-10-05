const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../models/task')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({ ...req.body, owner: req.user._id })
    // 在 taskSchema 中使用 ref: 'User' 以 owner 取用 user document 中的資料。

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(404).send()
    }
})

router.get('/tasks', auth, async (req, res) => {
    try {
        // const tasks = await Task.find({ owner: req.user._id })

        const match = {}
        const sort = {}

        if (req.query.completed) {
            match.completed = req.query.completed === 'true'
        }
        // 因為 query ?completed=true 會讓 req.query.completed 拿到 string 'true' or 'false'， 所以使用 req.query.completed === 'true' 來將 match.completed 賦值成 boolean true or false.

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }
        await req.user
            .populate({
                path: 'userTasks',
                match,
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort,
            })
            .execPopulate()
        res.send(req.user.userTasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' })
    }

    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id,
        })

        if (!task) {
            return res.status(404).send()
        }
        updates.forEach(update => (task[update] = req.body[update]))
        task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id,
        })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router
