const express = require('express')
const router = express.Router()
const fs = require('fs')
const upload = require('../middleware/uploadImage')

const verifyToken = require('../middleware/auth')

const Apartment = require('../models/Apartment')
const Room = require('../models/Room')
const Record = require('../models/Record')

router.post('/create', verifyToken, upload.array('photos'), async (req, res) => {
    const roomId = req.query.roomId

    const { electricNumber, waterNumber, recordedAt, isTheLast } = req.body
    console.log(req.body)
    if (!roomId || !electricNumber || !waterNumber || !recordedAt || !isTheLast) {
        return res.status(400).json({ success: false, message: 'Not enough required information' })
    }
    try {
        const record = await Record.findOne({ room: roomId, recordedAt: recordedAt })

        if (record) {
            console.log(record)
            return res.status(402).json({ success: false, message: 'You had created a record in this time' })
        }

        if (isTheLast == "true") {
            const records = await Record.updateMany(
                {},
                [{
                    $set: {
                        isTheLast: false
                    }
                }]
            )
        }

        const newRecord = new Record({
            electricNumber: electricNumber,
            waterNumber: waterNumber,
            recordedAt: recordedAt,
            isTheLast: isTheLast,
            room: roomId
        })

        let images = ""
        if (req.files) {
            req.files.forEach(function (files, index, arr) {
                images = images + files.path + ','
                console.log(files)
            })
            images = images.substring(0, images.lastIndexOf(","))
            newRecord.recordImages = images
        }

        await newRecord.save()
        res.json({ success: true, message: 'Save record successfully' })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

router.get('/get', verifyToken, async (req, res) => {
    const roomId = req.query.roomId
    const getLast = req.query.getLast
    const recordId = req.query.recordId

    if (!roomId && !recordId) {
        return res.status(400).json({ success: false, message: 'Not enough required information' })
    }

    try {
        if (getLast == true) {
            const record = await Record.findOne({ room: roomId, isTheLast: true })
            return res.json(record)
        }
        if (recordId) {
            const record = await Record.findById(recordId)
            if (!record) {
                return res.status(404).json({ success: false, message: "Not found record with given id" })
            }
            return res.json(record)
        }
        const records = await Record.find({ room: roomId })
        records.sort(function (a, b) {
            return stringToDate(b.recordedAt) - stringToDate(a.recordedAt)
        })
        res.json({ records })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

router.post('/update', verifyToken, upload.array('photos'), async (req, res) => {
    const roomId = req.query.roomId
    const recordId = req.query.recordId
    const { electricNumber, waterNumber, recordedAt } = req.body
    if (!roomId || !recordId) {
        return res.status(400).json({ success: false, message: 'Not enough required information' })
    }
    try {
        const theLastRecord = await Record.findOne({ room: roomId, isTheLast: true })
        const record = await Record.findOneAndUpdate(
            { _id: recordId },
            {
                electricNumber: electricNumber,
                waterNumber: waterNumber,
                recordedAt: recordedAt
            }
        )
        if (!record) {
            return res.status(404).json({ success: false, message: 'Not found record' })
        }
        let images = ""
        if (req.files) {
            req.files.forEach(function (files, index, arr) {
                images = images + files.path + ','
                console.log(files)
            })
            images = images.substring(0, images.lastIndexOf(","))
            record.recordImages = images
        }

        if (req.body.recordedAt && theLastRecord) {
            const lastDate = stringToDate(theLastRecord.recordedAt)
            const newDate = stringToDate(req.body.recordedAt)
            if (newDate > lastDate) {
                theLastRecord.isTheLast = false
                record.isTheLast = true
                await theLastRecord.save()
                await record.save()
            }
        }

        res.status(201).json({ success: true, message: `Update successfully` })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

router.delete('/delete', verifyToken, async (req, res) => {
    const recordId = req.query.recordId
    if (!recordId) {
        return res.status(400).json({ success: false, message: 'Not enough required information' })
    }
    try {
        const record = await Record.findOneAndDelete({ _id: recordId })
        if (!record) {
            return res.status(404).json({ success: false, message: 'Not found record with given id' })
        }
        var images = record.recordImages.split(",", 2)
        for (let index = 0; index < images.length; index++) {
            const element = images[index];
            fs.unlink(element, function (err) {
                if (err) throw err;
                console.log('File deleted!');
            })
        }
        res.json({ success: true, message: 'Delete record successfully' })
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