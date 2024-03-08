const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TenantSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    hometown: {
        type: String,
        required: true
    },
    identityCardNum: {
        type: Number,
        required: true
    },
    identityCardImgUrl: {
        type: String,
        required: true
    },
    room: {
        type: Schema.Types.ObjectId,
        ref: 'rooms'
    }
})

module.exports = mongoose.model('tenants', tenant)