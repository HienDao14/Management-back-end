const express = require('express')
const router = express.Router()
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const verifyToken = require('../middleware/auth')

// @route POST api/v1/auth/register
// @desc register User
// @access Public
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body

    if (!username || !password || !email)
        return res.status(400).json({ success: false, message: 'Missing some information, check again' })

    try {
        const user = await User.findOne({ $or: [{ username: username }, { email: email }] })

        if (user)
            return res.status(402).json({ success: false, message: 'Username already taken or Email has been used' })
        //Done check & hash password
        const hashedPassword = await argon2.hash(password)
        const newUser = new User({
            username: username,
            password: hashedPassword,
            email: email
        })
        await newUser.save()

        // Return token
        const accessToken = jwt.sign({ userId: newUser._id }, process.env.ACCESS_TOKEN_SECRET)

        res.json({ success: true, message: 'Create successfully', accessToken })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// @route POST api/v1/auth/login
// @desc Login User
// @access Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password)
        return res.status(400).json({ success: false, message: 'Missing username and/or password' })

    try {
        const user = await User.findOne({
            $or: [{ username: username }, { email: username }]
        })

        if (!user)
            return res.status(403).json({ success: false, message: 'Incorrect username' })

        // Username found => check password
        const passwordValid = await argon2.verify(user.password, password)
        if (!passwordValid)
            return res.status(403).json({ success: false, message: 'Incorrect  password' })

        // Return token
        const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET)

        res.json({ success: true, message: 'Login successfully', accessToken })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

router.get('/authenticate', verifyToken, async (req, res) => {
    try {
        res.json({ success: true })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

module.exports = router