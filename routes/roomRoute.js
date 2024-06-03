const express = require('express')
const router = express.Router()
const fs = require('fs')
const verifyToken = require('../middleware/auth')
const Room = require('../models/Room')
const Tenant = require('../models/Tenant')
const Record = require('../models/Record')

// @route POST api/v1/room/create
// @desc create room in apartment
// @access Private
router.post('/create', verifyToken, async (req, res) => {
    const apartmentId = req.query.apartmentId
    console.log(apartmentId)
    const { name, elecPricePerNum, pricePerMonth, waterPricePerMonth, area, description } = req.body
    console.log(req.body)
    if (!apartmentId || !name || !pricePerMonth || !elecPricePerNum || !waterPricePerMonth) {
        return res.status(400).json({ success: false, message: 'Not enough information required' })
    }

    try {
        const room = await Room.findOne({ name: name, apartment: apartmentId })

        if (room) {
            return res.status(400).json({ success: false, message: 'Name has been taken' })
        }

        const newRoom = new Room({
            apartment: apartmentId,
            name: name,
            elecPricePerNum: elecPricePerNum,
            pricePerMonth: pricePerMonth,
            waterPricePerMonth: waterPricePerMonth,
            available: true,
            area: area,
            description: description
        })

        await newRoom.save()
        res.json({ success: true, message: 'Create successfully' })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// @route POST api/v1/room/update
// @desc update room
// @access Private
router.post("/update", verifyToken, async (req, res) => {
    const apartmentId = req.query.apartmentId
    const roomId = req.query.roomId
    // const { name, elecPrice, roomPrice, waterPrice, area, description } = req.body
    console.log(req.body)
    if (!apartmentId || !roomId) {
        return res.status(400).json({ success: false, message: 'Not enough information required' })
    }

    try {
        const room = await Room.findOneAndUpdate(
            { apartment: apartmentId, _id: roomId },
            {
                $set: req.body
            }
        )
        if (!room) {
            return res.status(404).json({ success: false, message: 'Not found room with roomId given' })
        }

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
        const rooms = await Room.find({ apartment: apartmentId })

        if (!rooms) {
            return res.status(404).json({ success: false, message: "Not found rooms" })
        }
        res.json({ rooms })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

router.get('/get-records', verifyToken, async (req, res) => {
    const apartmentId = req.query.apartmentId
    if (!apartmentId) {
        return res.status(400).json({ success: false, message: 'Required apartment Id' })
    }
    try {
        const results = []
        const rooms = await Room.find({ apartment: apartmentId })
        for (let index = 0; index < rooms.length; index++) {
            const room = rooms[index];
            const lastRecord = await Record.findOne({ room: room._id, isTheLast: true })
            if (!lastRecord) {
                const roomResult = {
                    roomId: room._id,
                    roomName: room.name,
                    waterNumber: "",
                    electricNumber: "",
                    recordedAt: "",
                    recordId: ""
                }
                results.push(roomResult)
            } else {
                const roomResult = {
                    roomId: room._id,
                    roomName: room.name,
                    waterNumber: lastRecord.waterNumber,
                    electricNumber: lastRecord.electricNumber,
                    recordedAt: lastRecord.recordedAt,
                    recordId: lastRecord._id
                }
                results.push(roomResult)
            }
        }
        res.json({ rooms: results })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

router.get('/get-for-bill', verifyToken, async (req, res) => {
    const roomId = req.query.roomId
    if (!roomId) {
        return res.status(400).json({ success: false, message: 'Required roomId' })
    }
    try {
        const room = await Room.findOne({ _id: roomId })
        const records = await Record.find({ room: roomId })

        //decrease date time
        if (records) {
            records.sort(function (a, b) {
                return stringToDate(b.recordedAt) - stringToDate(a.recordedAt)
            })
        }
        if (!room) {
            return res.status(404).json({ success: false, message: 'Not found room' })
        }
        res.status(200).json({ room, records })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// @route GET api/v1/room/get/:id
// @desc get room by id
// @access Private
router.get('/get/:id', verifyToken, async (req, res) => {
    const apartmentId = req.query.apartmentId
    const roomId = req.params.id
    if (!apartmentId || !roomId) {
        return res.status(400).json({ success: false, message: 'Required apartmentId and roomId' })
    }
    try {
        const room = await Room.findOne({ apartment: apartmentId, _id: roomId })
        if (!room) {
            return res.status(404).json({ success: false, message: 'Not found room' })
        }
        res.json(room)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// @route DELETE api/v1/room/delete/:id
// @desc delete room by id
// @access Private
router.delete('/delete/:id', verifyToken, async (req, res) => {
    const apartmentId = req.query.apartmentId
    const roomId = req.params.id

    if (!apartmentId || !roomId) {
        return res.status(400).json({ success: false, message: 'Required apartmentId and roomId' })
    }
    try {
        const tenant = await Tenant.deleteMany({
            room: roomId
        })

        const room = await Room.findOneAndDelete({ apartment: apartmentId, _id: roomId })
        if (!room) {
            return res.status(404).json({ success: false, message: 'Not found room' })
        }
        res.json({ success: true, message: 'Delete successfully' })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// @route DELETE api/v1/room/delete_all
// @desc delete rooms by apartmentId
// @access Private
router.delete('/delete_all', verifyToken, async (req, res) => {
    const apartmentId = req.query.apartmentId
    try {
        const rooms = await Room.deleteMany({ apartment: apartmentId })
        res.json({ success: true, message: "Delete successfully" })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

function stringToDate(str) {
    const [dd, mm, yyyy] = str.split('/');
    return new Date(yyyy, mm - 1, dd);
}

module.exports = router