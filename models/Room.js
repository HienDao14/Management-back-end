const mongoose = require('mongoose');
const Schema = mongoose.Schema

const RoomSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    tenantNumber: {
        type: Number,
        required: true,
        default: 1
    },
    elecPricePerNum: {
        type: Number,
        required: true
    },
    pricePerMonth: {
        type: Number,
        required: true
    },
    waterPricePerMonth: {
        type: Number,
        required: true
    },
    elecNumBefore: {
        type: Number,
        // required: true,
        default: 0
    },
    elecNumNow: {
        type: Number,
        //required: true,
        default: 0
    },
    description: {
        type: String,
        //required: true,
        default: ""
    },
    totalPrice: {
        type: String,
        //required: true,
        default: ""
    },
    status: {
        type: String,
        required: true,
        default: "Available"
    },
    apartment: {
        type: Schema.Types.ObjectId,
        ref: 'apartments'
    }
})

module.exports = mongoose.model('rooms', RoomSchema)