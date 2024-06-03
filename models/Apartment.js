const mongoose = require('mongoose');
const Schema = mongoose.Schema

const ApartmentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    roomCount: {
        type: Number,
        required: true
    },
    roomEmpty: {
        type: Number
    },
    address: {
        type: String,
        required: true,
        unique: true
    },
    getBillDate: {
        type: Number,
        default: 1
    },
    description: {
        type: String,
        default: ""
    },
    defaultElecPrice: {
        type: Number
    },
    defaultWaterPrice: {
        type: Number
    },
    defaultRoomPrice: {
        type: Number
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
})

module.exports = mongoose.model('apartments', ApartmentSchema);