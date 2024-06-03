const express = require('express')
const router = express.Router()
const fileUpload = require('express-fileupload')
const fs = require('fs')

const verifyToken = require('../middleware/auth')
const Tenant = require('../models/Tenant')

const upload = require('../middleware/uploadImage')
const { verify } = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const Room = require('../models/Room')
// @route POST api/v1/tenant/create
// @desc create tenant
// @access Private
router.post('/create', verifyToken, upload.array('photos'), async (req, res) => {
    const apartmentId = req.query.apartmentId
    const roomId = req.query.roomId

    const { fullName, gender, dob, phoneNum, placeOfOrigin, identityCard, deposit, startDate, endDate, note, roomName } = req.body
    console.log(req.body)
    if (!fullName || !gender || !dob || !phoneNum || !placeOfOrigin || !identityCard || !deposit || !startDate || !roomName) {
        return res.status(400).json({ success: false, message: 'Not enough information' })
    }

    try {

        const tenant = await Tenant.findOne({ room: roomId, identityCard: identityCard })
        if (tenant) {
            return res.status(401).json({ success: false, message: 'Tenant with that ID Card already had' })
        }

        const newTenant = new Tenant({
            fullName: fullName,
            gender: gender,
            phoneNum: phoneNum,
            dob: dob,
            placeOfOrigin: placeOfOrigin,
            identityCardNum: identityCard,
            deposit: deposit,
            startDate: startDate,
            endDate: endDate,
            note: note,
            roomName: roomName,
            room: roomId,
            apartment: apartmentId
        })

        let images = ""
        if (req.files) {
            req.files.forEach(function (files, index, arr) {
                images = images + files.path + ','
                console.log(files)
            })
            images = images.substring(0, images.lastIndexOf(","))
            newTenant.identityCardImages = images
        }
        await newTenant.save()
        if (!endDate) {
            const room = await Room.findOneAndUpdate(
                { _id: roomId },
                [{
                    $set: {
                        available: false,
                        tenantNumber: {
                            $add: ["$tenantNumber", 1]
                        }
                    }
                }]
            )
        }
        res.json({ success: true, message: 'Save your apartment successfully' })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// @route POST api/v1/tenant/update
// @desc update tenant
// @access Private
router.post('/update', verifyToken, upload.array('photos'), async (req, res) => {
    const tenantId = req.query.tenantId

    const { fullName, gender, dob, phoneNum, placeOfOrigin, identityCard, deposit, startDate, endDate, note, roomName } = req.body

    console.log(req.body)
    if (!fullName || !gender || !dob || !phoneNum || !placeOfOrigin || !identityCard || !deposit || !startDate || !roomName) {
        return res.status(400).json({ success: false, message: 'Not enough information' })
    }

    try {
        if (endDate) {
            var endDateBody = endDate
        } else {
            var endDateBody = ""
        }
        const oldTenant = await Tenant.findById(tenantId)
        const tenant = await Tenant.findOneAndUpdate(
            { _id: tenantId },
            {
                $set: {
                    fullName: fullName,
                    gender: gender,
                    phoneNum: phoneNum,
                    dob: dob,
                    placeOfOrigin: placeOfOrigin,
                    identityCardNum: identityCard,
                    deposit: deposit,
                    startDate: startDate,
                    endDate: endDateBody,
                    note: note,
                    roomName: roomName
                }
            }
        )
        if (!tenant) {
            console.log("Not found tenant")
            return res.status(404).json({ success: false, message: "Not found tenant" })
        }
        let images = ""
        if (req.files) {
            req.files.forEach(function (files, index, arr) {
                images = images + files.path + ','
                console.log(files)
            })
            images = images.substring(0, images.lastIndexOf(","))
            tenant.identityCardImages = images
        }
        if (oldTenant.endDate && !endDate) {
            const room = await Room.updateOne(
                { _id: tenant.room },
                [{
                    $set: {
                        available: false,
                        tenantNumber: {
                            $add: ["$tenantNumber", 1]
                        }
                    }
                }], { upsert: true, new: true }
            )
        }
        if ((!oldTenant.endDate || oldTenant.endDate == "") && endDate) {
            const room = await Room.updateOne(
                { _id: tenant.room },
                [{
                    $set: {
                        available: {
                            "$cond": {
                                "if": {
                                    "$eq": ["$tenantNumber", 1]
                                },
                                "then": true,
                                "else": false
                            }
                        },
                        tenantNumber: {
                            $add: ["$tenantNumber", -1]
                        }
                    }
                }], { upsert: true, new: true }
            )
        }
        
        res.json({ success: true, message: "Update successfully" })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// @route GET api/v1/tenant/get
// @desc get tenants with roomId 
// @access Private
router.get('/get', verifyToken, async (req, res) => {
    const roomId = req.query.roomId

    if (!roomId) {
        return res.status(400).json({ success: false, message: 'Missing roomId' })
    }
    try {
        const tenants = await Tenant.find({ room: roomId })

        return res.json({ tenants })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// @route GET api/v1/tenant/get-apartment
// @desc get tenants with apartmentId 
// @access Private
router.get('/get-apartment', verifyToken, async (req, res) => {
    const apartmentId = req.query.apartmentId

    if (!apartmentId) {
        return res.status(400).json({ success: false, message: 'Missing roomId' })
    }

    try {
        const tenants = await Tenant.find({ apartment: apartmentId })

        return res.json({ tenants })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// @route GET api/v1/tenant/get/:id
// @desc get tenant with id
// @access Private
router.get('/get/:id', verifyToken, async (req, res) => {
    const tenantId = req.params.id

    if (!tenantId) {
        return res.status(400).json({ success: false, message: 'Missing information' })
    }
    try {
        const tenant = await Tenant.findOne({ _id: tenantId })
        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Not found tenant' })
        }
        return res.json(tenant)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// @route DELETE api/v1/tenant/deleteAll
// @desc delete all tenants 
// @access Private
router.delete('/deleteAll', verifyToken, async (req, res) => {
    try {
        const tenants = await Tenant.deleteMany({});
        res.json({ success: true, message: 'Delete successfully' })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// @route DELETE api/v1/tenant/delete/:id
// @desc delete tenant with id 
// @access Private
router.delete('/delete/:id', verifyToken, async (req, res) => {
    const roomId = req.query.roomId
    const tenantId = req.params.id
    if (!roomId || !tenantId) {
        return res.status(400).json({ success: false, message: 'Missing information' })
    }
    try {
        const tenant = await Tenant.findOneAndDelete({ room: roomId, _id: tenantId })
        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Not found tenant' })
        }
        const room = await Room.findOneAndUpdate(
            { _id: roomId },
            [{
                $set: {
                    available: {
                        "$cond": {
                            "if": {
                                "$eq": ["$tenantNumber", 1]
                            },
                            "then": true,
                            "else": false
                        }
                    },
                    tenantNumber: {
                        $add: ["$tenantNumber", -1]
                    }
                }
            }], { upsert: true, new: true }
        )
        var images = tenant.identityCardImages.split(",", 2)
        for (let index = 0; index < images.length; index++) {
            const element = images[index];
            fs.unlink(element, function (err) {
                if (err) throw err;
                console.log('File deleted!');
            })
        }
        // if (room.tenantNumber = 0) {
        //     await Room.findOneAndUpdate(
        //         { _id: roomId },
        //         {
        //             $set: {
        //                 available: false
        //             }
        //         }
        //     )
        // }
        return res.json({ success: true, message: 'Delete successfully' })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

module.exports = router