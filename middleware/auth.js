const jwt = require('jsonwebtoken')
const authMethod = require('./auth_method')

// jwt header: Authorization: Bearer *token*
const verifyToken = async (req, res, next) => {
    const authHeader = req.header('Authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return res.status(401).json({ success: false, message: 'Access token not found' })

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        req.userId = decoded.userId
        next()
    } catch (error) {
        console.log(error.message)
        return res.status(405).json({ success: false, message: 'Invalid token' })
    }
}

module.exports = verifyToken