const express = require('express')
const router = express.Router()

const verifyToken = require('../middleware/auth')
const User = require('../models/User')

router.get('/get-user', verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.userId
        })

        if (!user) {
            return res.status(404).json({ success: false, message: 'Not found User' })
        }
        res.json({

            userId: user._id,
            username: user.username,
            email: user.email

        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})


module.exports = router