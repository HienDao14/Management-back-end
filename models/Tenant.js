const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TenantSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    phoneNum: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        required: true
    },
    placeOfOrigin: {
        type: String,
        required: true
    },
    identityCardNum: {
        type: Number,
        required: true
    },
    identityCardImages: {
        type: String
    },
    deposit: {
        type: Number,
        default: 0
    },
    startDate: {
        type: String,
        required: true
    },
    endDate: {
        type: String
    },
    note: {
        type: String,
        default: ""
    },
    roomName: {
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

module.exports = mongoose.model('tenants', TenantSchema)