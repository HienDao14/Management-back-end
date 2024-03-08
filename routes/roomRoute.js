const express = require('express')
const router = express.Router()

const verifyToken = require('../middleware/auth')
const Room = require('../models/Room')

// @route POST api/v1/room/create
// @desc create room in apartment
// @access Private
router.post('/create', verifyToken, async (req, res) => {
    const { apartmentId, name, count, elecPrice, roomPrice, waterPrice, status } = req.body
    try {
        const room = await Room.findOne({ name: name, apartment: apartmentId })
        if (room) {
            return res.status(400).json({ success: false, message: 'Name has been taken' })
        }

        const newRoom = new Room({
            apartment: apartmentId,
            name: name,
            tenantNumber: count,
            elecPricePerNum: elecPrice,
            pricePerMonth: roomPrice,
            waterPricePerMonth: waterPrice,
            status: status
        })
        await newRoom.save()
        res.json({ success: true, message: 'Create successfully' })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }

})

// @route GET api/v1/room/get
// @desc get rooms in apartment
// @access Private
router.get('/get', verifyToken, async (req, res) => {
    const apartmentId = req.query.apartmentId
    if (!apartmentId) {
        return res.status(400).json({ success: false, message: 'Required apartment Id' })
    }
    try {
        const rooms = await Room.find({ apartment: apartmentId }).populate('apartment', ['address', 'description'])
        res.json({ success: true, rooms })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

module.exports = router