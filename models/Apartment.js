const mongoose = require('mongoose');
const Schema = mongoose.Schema

const ApartmentSchema = new Schema({
    roomCount: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    area: {
        type: Number
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
})

module.exports = mongoose.model('apartments', ApartmentSchema);