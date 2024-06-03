const express = require('express')
const Bill = require('../models/Bill')
const Room = require('../models/Room')
const verifyToken = require('../middleware/auth')
const router = express.Router()
const fs = require('fs')

router.post('/create', verifyToken, async (req, res) => {
    const roomId = req.query.roomId
    const apartmentId = req.query.apartmentId
    const { name, oldElectricNumber, newElectricNumber, electricNumber, electricPrice, roomPrice,
        oldWaterNumber, newWaterNumber, waterNumber, waterPrice, total, createdAt, status,
        paidAt, roomName, note, additionServices } = req.body
    console.log(req.body)
    // body: [Map<String, Int>]
    try {
        const room = await Room.findOneAndUpdate(
            { _id: roomId },
            {
                $inc: {
                    unpaidBill: 1
                }
            }
        )

        if (!room) {
            return res.status(404).json({ success: false, message: "Not found room that bill belong" })
        }

        const newBill = new Bill({
            name: name,
            newElectricNumber: newElectricNumber,
            oldElectricNumber: oldElectricNumber,
            electricNumber: electricNumber,
            electricPrice: electricPrice,
            oldWaterNumber: oldWaterNumber,
            newWaterNumber: newWaterNumber,
            waterNumber: waterNumber,
            waterPrice: waterPrice,
            roomPrice: roomPrice,
            total: total,
            createdAt: createdAt,
            status: status,
            paidAt: paidAt,
            roomName: roomName,
            note: note,
            additionServices: JSON.stringify(additionServices),
            room: roomId,
            apartment: apartmentId
        })
        await newBill.save()

        res.json({ newBill })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

router.get('/get', verifyToken, async (req, res) => {
    const roomId = req.query.roomId
    const apartmentId = req.query.apartmentId
    const billId = req.query.billId
    try {
        if (roomId) {
            const bills = await Bill.find({ room: roomId })
            return res.json({ bills })
        } else if (apartmentId) {
            const bills = await Bill.find({ apartment: apartmentId })
            return res.json({ bills })
        } else if (billId) {
            const bill = await Bill.findOne({ _id: billId })

            return res.json(bill)
        }
        res.status(400).json({ success: false, message: 'Require id' })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})


router.get('/get-unpaid', verifyToken, async (req, res) => {
    const roomId = req.query.roomId
    const apartmentId = req.query.apartmentId
    try {
        if (roomId) {
            const bills = await Bill.find({ room: roomId, status: false })
            return res.json({ bills })
        } else if (apartmentId) {
            const bills = await Bill.find({ apartment: apartmentId, status: false })
            return res.json({ bills })
        }
        res.status(400).json({ success: false, message: 'Require roomId or apartmentId' })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

router.post('/update', verifyToken, async (req, res) => {
    const billId = req.query.billId
    const { name, oldElectricNumber, newElectricNumber, electricNumber, electricPrice, roomPrice,
        oldWaterNumber, newWaterNumber, waterNumber, waterPrice, total, createdAt, status,
        paidAt, roomName, note, additionServices } = req.body
    if (!billId) {
        return res.status(400).json({ success: false, message: 'Not found bill Id' })
    }
    try {
        const oldBill = await Bill.findOne({ _id: billId })

        const bill = await Bill.findOneAndUpdate(
            { _id: billId },
            {
                $set: {
                    name: name,
                    newElectricNumber: newElectricNumber,
                    oldElectricNumber: oldElectricNumber,
                    electricNumber: electricNumber,
                    electricPrice: electricPrice,
                    oldWaterNumber: oldWaterNumber,
                    newWaterNumber: newWaterNumber,
                    waterNumber: waterNumber,
                    waterPrice: waterPrice,
                    roomPrice: roomPrice,
                    total: total,
                    createdAt: createdAt,
                    status: status,
                    paidAt: paidAt,
                    roomName: roomName,
                    note: note,
                    additionServices: JSON.stringify(additionServices)
                }
            }
        )
        if (!bill) {
            return res.status(404).json({ success: false, message: "Not found bill" })
        }

        if (oldBill.status && !status) {
            const room = await Room.updateOne(
                { _id: bill.room },
                {
                    $inc: {
                        unpaidBill: 1
                    }
                }
            )
        }
        if (!oldBill.status && status) {
            const room = await Room.updateOne(
                { _id: bill.room },
                {
                    $inc: {
                        unpaidBill: -1
                    }
                }
            )
        }

        res.json({ success: true, message: "Update successfully" })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

router.delete('delete', verifyToken, async (req, res) => {
    const billId = req.query.billId
    if (!billId) {
        return res.status(400).json({ success: false, message: 'Not found bill Id' })
    }
    try {
        const bill = await Bill.findOneAndDelete({ _id: billId })
        if (!bill) {
            return res.status(404).json({ success: false, message: "Not found bill" })
        }
        var images = bill.billImages.split(",")
        for (let index = 0; index < images.length; index++) {
            const element = images[index];
            fs.unlink(element, function (err) {
                if (err) throw err;
                console.log('File deleted!');
            })
        }
        res.json({ success: true, message: 'Delete bill successfully' })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

module.exports = router