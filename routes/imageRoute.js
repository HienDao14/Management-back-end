const express = require('express')
const router = express.Router()

const upload = require('../middleware/uploadImage')

router.post('/upload_image', upload.single('picture'), (req, res) => {
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');
    // Define a JSONobject for the image attributes for saving to database

    var finalImg = {
        contentType: req.file.mimetype,
        image: new Buffer(encode_image, 'base64')
    };
    db.collection('quotes').insertOne(finalImg, (err, result) => {
        console.log(result)

        if (err) return console.log(err)

        console.log('saved to database')
        res.redirect('/')
    })
})