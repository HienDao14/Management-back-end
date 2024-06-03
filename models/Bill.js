const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BillSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    newElectricNumber: {
        type: String,
        requried: true
    },
    oldElectricNumber: {
        type: String,
        required: true
    },
    electricNumber: {
        type: Number,
        required: true
    },
    electricPrice: {
        type: Number,
        required: true
    },
    newWaterNumber: {
        type: String,
        requried: true
    },
    oldWaterNumber: {
        type: String,
        required: true
    },
    waterNumber: {
        type: Number,
        required: true
    },    
    waterPrice: {
        type: Number,
        required: true
    },
    roomPrice: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    createdAt: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    paidAt:{
        type: String
    },
    billImages: {
        type: String
    },
    roomName: {
        type: String
    },
    note: {
        type: String
    },
    additionServices: {
        type: String
    },
    room: {
        type: Schema.Types.ObjectId,
        ref: 'rooms'
    },
    apartment: {
        type: Schema.Types.ObjectId,
        ref: 'apartments'
    }    
})

module.exports = mongoose.model('bills', BillSchema)