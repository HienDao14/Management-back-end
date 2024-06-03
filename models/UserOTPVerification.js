const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserOTPVerificationSchema = new Schema({
    email: String,
    otp: String,
    createdAt: Date,
    expiredAt: Date
});

module.exports = mongoose.model("UserOTPVerification", UserOTPVerificationSchema);