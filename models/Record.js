const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecordSchema = new Schema({
    waterNumber: {
        type: String,
        required: true
    },
    electricNumber: {
        type: String,
        required: true
    },
    recordImages: {
        type: String
    },
    recordedAt: {
        type: String,
        required: true
    },
    isTheLast: {
        type: Boolean
    },
    room: {
        type: Schema.Types.ObjectId,
        ref: 'rooms'
    }
});

module.exports = mongoose.model("ElectricRecord", RecordSchema);