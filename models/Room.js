const mongoose = require('mongoose');
const Schema = mongoose.Schema

const RoomSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    tenantNumber: {
        type: Number,
        default: 0
    },
    elecPricePerNum: {
        type: Number,
    },
    pricePerMonth: {
        type: Number,
    },
    waterPricePerMonth: {
        type: Number,
    },
    description: {
        type: String,
        default: ""
    },
    available: {
        type: Boolean,
        default: true
    },
    area: {
        type: Number
    },
    unpaidBill: {
        type: Number,
        default: 0
    },
    apartment: {
        type: Schema.Types.ObjectId,
        ref: 'apartments'
    }
})

module.exports = mongoose.model('rooms', RoomSchema)