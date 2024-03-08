const express = require('express')
const router = express.Router()

const verifyToken = require('../middleware/auth')

const Apartment = require('../models/Apartment')

// @route POST api/v1/apartment/create
// @desc create apartment
// @access Private
router.post('/create', verifyToken, async (req, res) => {
    const { roomCount, address } = req.body

    if (!roomCount || !address)
        return res.status(400).json({ success: false, message: 'Missing some information' })

    try {
        const apartment = await Apartment.findOne({ address: address, user: req.userId })
        if (apartment) {
            return res.status(400).json({ success: false, message: 'Apartment in this address was created' })
        }
        const newApartment = new Apartment({
            roomCount: roomCount,
            address: address,
            user: req.userId
        })

        await newApartment.save()
        res.json({ success: true, message: 'Save your apartment successfully', apartment: newApartment })

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
        const apartments = await Apartment.find({ user: req.userId }).populate('user', ['username', 'email'])
        res.json({ success: true, apartments })

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

        if (!deleteApartment)
            return res.status(404).json({ success: false, message: 'Not found apartment or user unauthorised' })

        res.json({ success: true, message: 'deleted', deleteApartment })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

module.exports = router