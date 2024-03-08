const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config()

const authRouter = require('./routes/auth')
const apartmentRouter = require('./routes/apartmentRoute')
const roomRouter = require('./routes/roomRoute')

const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@managecluster.telu7a8.mongodb.net/?retryWrites=true&w=majority&appName=ManageCluster`)
        console.log('MongoDB connected');
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}

connectDB()

const app = express()
app.use(express.json())

app.use('/api/v1/auth', authRouter)

app.use('/api/v1/apartment', apartmentRouter)

app.use('/api/v1/room', roomRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running in http://localhost:${PORT}`)
})