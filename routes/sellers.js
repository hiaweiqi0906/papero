const dotenv = require('dotenv')

dotenv.config()

const express = require("express");
const router = express.Router();
const mongoose = require('mongoose')
const Grid = require('gridfs-stream')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const db = process.env.MONGO_URI;
const User = require('../models/User')
const Book = require('../models/Book')
const upload = require('../utils/multer')
const cloudinary = require("../utils/cloudinary");

//initialize all required things for read and write img to db
let imageName = []
let gfs
var conn = mongoose.createConnection(db);
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('book-img')
})


//middleware
router.use(express.urlencoded({ extended: false }))
router.use(bodyParser.json())
router.use(methodOverride('_method'))

router.post('/test', upload.single("coverImg"), async (req, res) => {
    try {

        let result;
        if (req.file) {
            let user = await User.findOne({ email: req.body.email });
            if (user.cloudinaryID) {
                await cloudinary.uploader.destroy(user.cloudinaryID);
            }

            result = await cloudinary.uploader.upload(req.file.path);
            const data = {
                avatarUri: result?.secure_url || user.avatarUri,
                cloudinaryID: result?.public_id || user.cloudinaryID,
            };
            user = await User.findOneAndUpdate({ email: req.body.email }, data, { new: true });
        }
        User.findOneAndUpdate({ email: req.body.email }, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            gender: req.body.gender,
            noTel: req.body.noTel,
            states: req.body.states,
            location: req.body.location,
            whatsappLink: req.body.whatsappLink,
            messengerLink: req.body.messengerLink,
            wechatLink: req.body.wechatLink,
            instagramLink: req.body.instagramLink
        }, (err, doc) => {
            if (err) throw err
            else {
                res.send({ msg: 'Updated' })
            }
        })
            .then(user => {

            })
            .catch(err => console.log(err))

    } catch (err) {
        console.log(err)
        res.sendStatus(400)
    }
})

router.post('/upload', upload.fields([{ //upload pic to db
    name: 'coverImg', maxCount: 1
}, {
    name: 'img1', maxCount: 1
}, {
    name: 'img2', maxCount: 1
}, {
    name: 'img3', maxCount: 1
}]), async (req, res) => {
    
    try {
        const newFiles = [];
        if (req.files.coverImg) {
            newFiles.push(req.files.coverImg[0]);
        }
        if (req.files.img1) {
            newFiles.push(req.files.img1[0]);
        }
        if (req.files.img2) {
            newFiles.push(req.files.img2[0]);
        }

        let imgUri = []
        let imgID = []

        for (let i = 0; i < newFiles.length; i++) {
            var result = await (cloudinary.uploader.upload(newFiles[i].path))
            imgUri.push(result.secure_url)
            imgID.push(result.public_id)
        }
        const coverImageUri = imgUri.shift()
        const coverImageId = imgID.shift()
        const newBook = new Book({
            bookTitle: req.body.title,
            coverImgUri: coverImageUri,
            imageUri: imgUri,
            coverImgId: coverImageId,
            imageId: imgID,
            price: req.body.price,
            description: req.body.description,
            category: req.body.categories,
            uploadedBy: req.body.uploadedBy,
            publishingCompany: '',
            bookLanguage: req.body.language,
            isbn: 0,
            coverType: '',
            year: req.body.year,
            quantity: 1,
            states: req.body.states,
            location: req.body.location,
            contactNumber: req.body.contactNumber,
            whatsappLink: req.body.whatsappLink,
            messengerLink: req.body.messengerLink,
            wechatLink: req.body.wechatLink,
            instagramLink: req.body.instagramLink,
        })

        newBook.save()
            .then(() => {
                res.send('ok')
            })
            .catch((err) => console.log(err))
    } catch (err) {
        console.log(err);
    }
})

router.post('/edit/:bookID', upload.fields([{ //upload pic to db
    name: 'coverImg', maxCount: 1
}, {
    name: 'img1', maxCount: 1
}, {
    name: 'img2', maxCount: 1
}, {
    name: 'img3', maxCount: 1
}]), async (req, res) => {
    //check if 
    Book.findOne({ _id: new mongoose.Types.ObjectId(req.params.bookID) }, async (err, book) => {

        if (err) console.log(err);
        if (req.files) {
            let imgUri = []
            let imgID = []
            let result
            if (req.files.coverImg) {
                //upload new
                result = await (cloudinary.uploader.upload(req.files.coverImg[0].path))

                //delete old
                await cloudinary.uploader.destroy(book.coverImgId)

                imgUri.push(result.secure_url)
                imgID.push(result.public_id)
            } else {
                //push old img Id
                //push old img Uri
                imgUri.push(book.coverImgUri)
                imgID.push(book.coverImgId)
            }

            if (req.files.img1) {
                //if got old, 
                //delete old
                if (book.imageUri[0]) await cloudinary.uploader.destroy(book.imageId[0])
                //upload new
                result = await (cloudinary.uploader.upload(req.files.img1[0].path))
                //push result img Id
                //push result img Uri
                imgUri.push(result.secure_url)
                imgID.push(result.public_id)
            } else {
                //if got old
                //push old img Id
                //push old img Uri
                if (book.imageUri[0]) imgUri.push(book.imageUri[0]);
            }

            if (req.files.img2) {
                //if got old, 
                //delete old
                if (book.imageUri[1]) await cloudinary.uploader.destroy(book.imageId[1])
                //upload new
                result = await (cloudinary.uploader.upload(req.files.img2[0].path))
                //push result img Id
                //push result img Uri
                imgUri.push(result.secure_url)
                imgID.push(result.public_id)
            } else {
                //if got old
                //push old img Id
                //push old img Uri
                if (book.imageUri[1]) imgUri.push(book.imageUri[1]);
            }

            if (req.files.img3) {
                //if got old, 
                //delete old
                if (book.imageUri[2]) await cloudinary.uploader.destroy(book.imageId[2])
                //upload new
                result = await (cloudinary.uploader.upload(req.files.img3[0].path))
                //push result img Id
                //push result img Uri
                imgUri.push(result.secure_url)
                imgID.push(result.public_id)
            } else {
                //if got old
                //push old img Id
                //push old img Uri
                if (book.imageUri[2]) imgUri.push(book.imageUri[2]);
            }

            //check all info entered
            const coverImgId = imgID.shift()
            const coverImgUri = imgUri.shift()
            Book.updateOne({ _id: new mongoose.Types.ObjectId(req.params.bookID) },
                {
                    bookTitle: req.body.bookTitle,
                    coverImgUri: coverImgUri,
                    imageUri: imgUri,
                    coverImgId: coverImgId,
                    imageId: imgID,
                    price: req.body.price,
                    description: req.body.description,
                    category: req.body.category,
                    uploadedBy: req.body.uploadedBy,
                    publishingCompany: '',
                    language: req.body.bookLanguage,
                    isbn: 0,
                    coverType: '',
                    year: req.body.year,
                    quantity: 1,
                    states: req.body.states,
                    location: req.body.location,
                    contactNumber: req.body.noTel,
                    whatsappLink: req.body.whatsappLink,
                    messengerLink: req.body.messengerLink,
                    wechatLink: req.body.wechatLink,
                    instagramLink: req.body.instagramLink,
                }, function (err, docs) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        res.send({ msg: 'Book Updated' })
                    }
                });

        } else {
            Book.updateOne({ _id: new mongoose.Types.ObjectId(req.params.bookID) },
                {
                    bookTitle: req.body.bookTitle,
                    price: req.body.price,
                    description: req.body.description,
                    category: req.body.category,
                    uploadedBy: req.body.uploadedBy,
                    publishingCompany: '',
                    language: req.body.bookLanguage,
                    isbn: 0,
                    coverType: '',
                    year: req.body.year,
                    quantity: 1,
                    states: req.body.states,
                    location: req.body.location,
                    contactNumber: req.body.contactNumber,
                    whatsappLink: req.body.whatsappLink,
                    messengerLink: req.body.messengerLink,
                    wechatLink: req.body.wechatLink,
                    instagramLink: req.body.instagramLink,
                }, function (err, docs) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        res.send({ msg: 'Book Updated' })
                    }
                });
        }
    })
})

module.exports = router;