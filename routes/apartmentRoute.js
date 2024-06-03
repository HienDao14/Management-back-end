const express = require('express')
const router = express.Router()

const upload = require('../middleware/uploadImage')

const verifyToken = require('../middleware/auth')

const Apartment = require('../models/Apartment')
const Room = require('../models/Room')

// @route POST api/v1/apartment/create
// @desc create apartment
// @access Private
router.post('/create', verifyToken, async (req, res) => {
    const { name, roomCount, address, description, defaultRoomPrice, defaultElecPrice, defaultWaterPrice } = req.body
    const createRoom = req.query.isCreate

    if (!name || !roomCount || !address)
        return res.status(400).json({ success: false, message: 'Missing some information' })

    if (createRoom == "true" && (!defaultElecPrice || !defaultRoomPrice || !defaultWaterPrice)) {
        return res.status(400).json({ success: false, message: 'Missing some information when create Room' })
    }

    try {
        const apartment = await Apartment.findOne({ name: name, address: address, user: req.userId })
        if (apartment) {
            return res.status(401).json({ success: false, message: 'Apartment in this address was created' })
        }
        const newApartment = new Apartment({
            name: name,
            roomCount: roomCount,
            roomEmpty: roomCount,
            address: address,
            description: description,
            defaultElecPrice: defaultElecPrice,
            defaultWaterPrice: defaultWaterPrice,
            defaultRoomPrice: defaultRoomPrice,
            user: req.userId
        })

        await newApartment.save()
        if (createRoom == "true") {
            for (let index = 1; index <= roomCount; index++) {
                const room = new Room({
                    apartment: newApartment._id,
                    name: `Phong tro so ${index}`,
                    elecPricePerNum: defaultElecPrice,
                    waterPricePerMonth: defaultWaterPrice,
                    pricePerMonth: defaultRoomPrice
                })
                await room.save()
            }
        }
        res.json({ success: true, message: 'Save your apartment successfully' })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// @route UPDATE api/v1/apartment/update
// @desc update apartment's info
// @access Private 
router.post('/update', verifyToken, async (req, res) => {
    const apartmentId = req.query.apartmentId
    console.log(req.body)
    try {
        const apartment = await Apartment.findOneAndUpdate(
            { user: req.userId, _id: apartmentId },
            {
                $set: req.body
            }
        )

        if (!apartment) {
            return res.status(404).json({ success: false, message: 'Not found apartment' })
        }

        res.status(200).json({ success: true, message: `Update successfully` })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// @route GET api/v1/apartment/get
// @desc get apartments
// @access Private
router.get('/get', verifyToken, async (req, res) => {
    try {
        const listApartment = await Apartment.find({ user: req.userId })

        listApartment.forEach(async (apartment, index, arr) => {
            const rooms = await Room.find({ apartment: apartment._id })
            const empty_rooms = await Room.find({ apartment: apartment._id, available: true })
            await Apartment.updateOne(
                { _id: apartment._id },
                {
                    $set: {
                        roomCount: rooms.length,
                        roomEmpty: empty_rooms.length
                    }
                }
            )
        })
        const apartments = await Apartment.find({ user: req.userId })
        res.json({ apartments })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })

    }
})

// @route GET api/v1/apartment/get/{id}
// @desc get apartments
// @access Private
router.get('/get/:id', verifyToken, async (req, res) => {
    try {
        const apartment = await Apartment.findOne({ user: req.userId, _id: req.params.id })
        if (!apartment) {
            return res.status(404).json({ success: false, message: 'Not found apartment' })
        }
        let rooms = await Room.find({ apartment: req.params.id, available: true })
        apartment.roomEmpty = rooms.length
        rooms = await Room.find({ apartment: req.params.id })
        apartment.roomCount = rooms.length
        console.log(apartment)
        res.json({ apartment })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })

    }
})

// @route DELETE api/v1/apartment/delete
// @desc delete apartments
// @access Private
router.delete('/delete', verifyToken, async (req, res) => {
    const apartmentId = req.query.apartmentId
    if (!apartmentId) {
        return res.status(400).json({ success: false, message: 'Require apartment Id' })
    }
    try {
        const apartmentDeleteCondition = { _id: apartmentId, user: req.userId }
        const deleteApartment = await Apartment.findOneAndDelete(apartmentDeleteCondition)
        const room = await Room.deleteMany({
            apartment: apartmentId
        })
        if (!deleteApartment)
            return res.status(404).json({ success: false, message: 'Not found apartment or user unauthorised' })

        res.json({ success: true, message: 'deleted', deleteApartment })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

router.post('/upload', upload.single('file'), (req, res, next) => {
    res.json(req.file)
})

router.post('/upload_multiple', upload.array('files', 12), (req, res, next) => {
    const files = req.files
    if (!files) {
        return res.status(400).json({ message: 'Some error occurred' })
    }
    res.json(files)
})

module.exports = router