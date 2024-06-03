const express = require('express')
const router = express.Router()
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const Mailgen = require('mailgen');
const randToken = require('rand-token')

require('dotenv').config()

const User = require('../models/User')
const UserOTPVerification = require('../models/UserOTPVerification')
const verifyToken = require('../middleware/auth')
const authMethod = require('../middleware/auth_method')

// @route POST api/v1/auth/register
// @desc register User
// @access Public
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body

    if (!username || !password || !email)
        return res.status(400).json({ success: false, message: 'Missing some information, check again' })

    try {
        const user = await User.findOne({ $or: [{ username: username }, { email: email }] })

        if (user)
            return res.status(402).json({ success: false, message: 'Username already taken or Email has been used' })
        //Done check & hash password
        const hashedPassword = await argon2.hash(password)
        const newUser = new User({
            username: username,
            password: hashedPassword,
            email: email
        })

        await newUser.save()

        // Return token
        const accessToken = jwt.sign({ userId: newUser._id }, process.env.ACCESS_TOKEN_SECRET)

        res.json({ success: true, message: 'Create successfully', accessToken })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// @route POST api/v1/auth/login
// @desc Login User
// @access Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password)
        return res.status(400).json({ success: false, message: 'Missing username and/or password' })

    try {
        const user = await User.findOne({
            $or: [{ username: username }, { email: username }]
        })

        if (!user)
            return res.status(403).json({ success: false, message: 'Incorrect username' })

        // Username found => check password
        const passwordValid = await argon2.verify(user.password, password)
        if (!passwordValid)
            return res.status(403).json({ success: false, message: 'Incorrect  password' })

        // Return token
        const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET)

        res.json({
            success: true,
            message: 'Login successfully',
            accessToken,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

router.post('/authenticate', verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.userId
        })
        res.json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// router.post('/refresh-token', async (req, res) => {
//     // Lấy access token từ header
//     const accessTokenFromHeader = req.header('Authorization');

//     if (!accessTokenFromHeader) {
//         return res.status(400).send('Không tìm thấy access token.');
//     }

//     // Lấy refresh token từ body
//     const refreshTokenFromBody = req.body.refreshToken;
//     if (!refreshTokenFromBody) {
//         return res.status(400).send('Không tìm thấy refresh token.');
//     }

//     const accessTokenSecret =
//         process.env.ACCESS_TOKEN_SECRET;
//     const accessTokenLife =
//         process.env.ACCESS_TOKEN_LIFE;

//     // Decode access token đó
//     const decoded = await authMethod.decodeToken(
//         accessTokenFromHeader,
//         accessTokenSecret,
//     );

//     if (!decoded) {
//         return res.status(400).send('Access token không hợp lệ.');
//     }

//     const username = decoded.payload.username; // Lấy username từ payload

//     const user = await User.findOne({ $or: [{ username: username }, { email: username }] });

//     if (!user) {
//         return res.status(401).send('User không tồn tại.');
//     }

//     if (refreshTokenFromBody !== user.refreshToken) {
//         return res.status(400).send('Refresh token không hợp lệ.');
//     }

//     // Tạo access token mới
//     const dataForAccessToken = {
//         username,
//     };

//     const accessToken = await authMethod.generateToken(
//         dataForAccessToken,
//         accessTokenSecret,
//         accessTokenLife,
//     );
//     if (!accessToken) {
//         return res
//             .status(400)
//             .send('Tạo access token không thành công, vui lòng thử lại.');
//     }
//     return res.json({
//         success: true,
//         accessToken,
//     });
// });

router.post('/forgot-password', async (req, res) => {

    try {
        const userEmail = req.query.userEmail;
        console.log(userEmail)
        //        Find User 
        const requestUser = User.findOne({ email: userEmail })

        if (!requestUser) {
            return res.status(404).json({ success: false, message: `User email not found!!!` })
        }

        //Generate OTP
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`

        //Config mail
        let config = {
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS
            }
        }

        let transporter = nodemailer.createTransport(config);

        let mailGen = new Mailgen({
            theme: "default",
            product: {
                name: "Mailgen",
                link: "https://mailgen.js"
            }
        })

        let response = {
            body: {
                name: "Từ: Ứng dụng quản lý phòng trọ",
                intro: "Đăng kí lại mật khẩu của bạn",
                text: `Đây chính là mã xác thực của bạn: ${otp}`,

                outro: "Mã xác thực sẽ mất hiệu lực sau 10 phút"
            }
        }

        let mail = mailGen.generate(response)

        let message = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: "Lấy lại mật khẩu",
            html: ` <p>Đây là mail đến từ Quản lý phòng trọ</p>
            <p>Chúng tôi đã nhận được yêu cầu cấp lại mật khẩu của bạn.</p>
            <p>Hãy nhập mã xác thực này vào ứng dụng:</p>        
            <h1> ${otp} </h1>
            <p>Mã này sẽ hết hiệu lực sau 10 phút</p>
            <p>Xin cảm ơn.</p>`
        }
        const hashedOTP = await argon2.hash(otp)
        const newOTPVerification = await new UserOTPVerification({
            email: userEmail,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiredAt: Date.now() + 600000
        })

        await newOTPVerification.save();

        transporter.sendMail(message).then(() => {
            return res.status(201).json({
                success: true, message: "You should receive an email"
            })
        }).catch(error => {
            return res.status(500).json({ success: false, message: error })
        });

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

router.post('/verifyOTP', async (req, res) => {
    try {
        const email = req.query.email
        const otp = req.query.otp

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: `Missing information` })
        }
        const requireUserOTPs = await UserOTPVerification.find({
            email: email
        })

        if (requireUserOTPs.length <= 0) {
            return res.status(404).json({ success: false, message: `Wrong or not exist email` })
        }
        const hashedOtp = requireUserOTPs[0].otp
        const expiredAt = requireUserOTPs[0].expiredAt

        if (expiredAt < Date.now()) {
            UserOTPVerification.deleteMany({ email: email })
            return res.status(405).json({ success: false, message: `OTp has expired. Please request again` })
        }

        const validOTP = await argon2.verify(hashedOtp, otp)
        if (!validOTP) {
            return res.status(403).json({ success: false, message: `Wrong OTP. Please check again` })
        }
        UserOTPVerification.deleteMany({ email: email })
        return res.status(200).json({ success: true, message: `Verification successfull` })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

router.post('/updatePass', async (req, res) => {
    try {
        const password = req.query.password
        const email = req.query.email

        const hashedPassword = await argon2.hash(password)
        const user = await User.findOneAndUpdate(
            { email: email },
            { $set: { password: hashedPassword } }
        )
        if (!user) {
            return res.status(404).json({ success: false, message: `Not found user` })
        }
        res.status(200).json({ success: true, message: `Update successfully` })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

module.exports = router