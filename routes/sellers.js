const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require('passport')
const { ensureAuthenticated } = require('../config/auth')
const path = require('path')
const mongoose = require('mongoose')
const crypto = require('crypto')
const multer = require('multer')
const { GridFsStorage } = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const db = require('../config/keys').MongoURI;
const Seller = require('../models/Seller')
const User = require('../models/User')
const Book = require('../models/Book')
const dotenv = require('dotenv')
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

// //create storage engine
// const storage = new GridFsStorage({
//     url: db,
//     file: (req, file) => {
//         return new Promise((resolve, reject) => {
//             crypto.randomBytes(16, (err, buf) => {
//                 if (err) {
//                     return reject(err);
//                 }
//                 const filename = buf.toString('hex') + path.extname(file.originalname);
//                 imageName.push(filename)
//                 const fileInfo = {
//                     filename: filename,
//                     bucketName: 'book-img'
//                 };
//                 resolve(fileInfo);
//             });
//         });
//     }
// });
// const upload = multer({ storage });


//middleware
router.use(express.urlencoded({ extended: false }))
router.use(bodyParser.json())
router.use(methodOverride('_method'))

/**
 * route: /sellers/login
 * 
 * desc: check if user is logged in.
 *       if yes, go to /store
 *       if not, render /users/login page
 */
router.get("/login", (req, res) => {
    if (req.user) {
        res.render('sellers/seller_dashboard')
    } else {
        res.redirect("/users/login");
    }
});

/**
 * route: /sellers/dashboard
 * desc: Go to sellers dashboard to do other things
 *      such as Upload, Edit, etc
 */
router.get("/dashboard", ensureAuthenticated, async (req, res) => {

    //check books uploaded by current user
    const books = await Book.find({ uploadedBy: req.user.email }).sort({ uploadedAt: 'desc' })
        .then()
        .catch()
    //   })
    let files2 = []
    let imgUri = []
    if (books.length === 0) res.render("sellers/seller_dashboard", { user: req.user, books: books, files: files2 });

    //parts to loop to get cover img for each book
    for (let i = 0; i < books.length; i++) {
        files2.push(books[i].coverImgUri)
        if ((i + 1) === books.length) {
            res.render("sellers/seller_dashboard", { user: req.user, books: books, files: files2 });
        }

    }
});

/**
 * route: /sellers/upload
 * desc: to allow user to upload
 */
router.get("/upload", ensureAuthenticated, (req, res) => {
    res.render("sellers/seller_upload", { user: req.user });
});

/**
 * route: /sellers/upload
 * desc: upload all details to db, together with pictures
 */
router.post('/upload', upload.fields([{ //upload pic to db
    name: 'coverImg', maxCount: 1
}, {
    name: 'img1', maxCount: 1
}, {
    name: 'img2', maxCount: 1
}, {
    name: 'img3', maxCount: 1
}]), async (req, res) => {
    const newFiles = [];
    const files = req.files;
    let imgID = []
    if (req.files.coverImg) {
        newFiles.push(req.files.coverImg[0]);
    }
    if (req.files.img1) {
        newFiles.push(req.files.img1[0]);
    }
    if (req.files.img2) {
        newFiles.push(req.files.img2[0]);
    }
    if (req.files.img3) {
        newFiles.push(req.files.img3[0]);
    }
    // let results=[]
    let imgUri = []
    for (let i = 0; i < newFiles.length; i++) {
        var result = await(cloudinary.uploader.upload(newFiles[i].path))
        imgUri.push(result.secure_url)
        imgID.push(result.public_id)
        // results.push(result)
    }
    //check all info entered
    const coverImageUri = imgUri.shift()
    const coverImageId = imgID.shift()

    //put photo uri to book instance
    //put all info to books collection
    const newBook = new Book({
        bookTitle: req.body.title,
        coverImgUri: coverImageUri,
        imageUri: imgUri,
        coverImgId: coverImageId,
        imageId: imgID,
        price: req.body.price,
        description: req.body.description,
        category: req.body.categories,
        uploadedBy: req.user.email,
        publishingCompany: '',
        language: req.body.language,
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
    })
    newBook.save()
        .then()
        .catch((err) => console.log(err))
    res.redirect('/sellers/dashboard')
})

/**
 * route: /sellers/register
 * desc: check if user is logged in,
 *      if not, redirect to /users/register
 *      else, go to /seller_dashboard
 */
router.get("/register", (req, res) => {
    if (req.user) {
        res.render('sellers/seller_dashboard')
    } else {
        res.redirect("/users/register");
    }
});

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
        let imgUri = []
        let imgID = []
        let result
        if (req.files.coverImg) {
            //upload new
            result = await(cloudinary.uploader.upload(req.files.coverImg[0].path))
            
            //delete old
            await cloudinary.uploader.destroy(book.coverImgId)

            //push result img Id
            //push result img Uri
            imgUri.push(result.secure_url)
            imgID.push(result.public_id)
            // removeId.push(new mongoose.Types.ObjectId(book.coverImgUri));
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
            result = await(cloudinary.uploader.upload(req.files.img1[0].path))
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
            result = await(cloudinary.uploader.upload(req.files.img2[0].path))
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
            result = await(cloudinary.uploader.upload(req.files.img3[0].path))
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
                bookTitle: req.body.title,
                coverImgUri: coverImgUri,
                imageUri: imgUri,
                coverImgId: coverImgId,
                imageId: imgID,
                price: req.body.price,
                description: req.body.description,
                category: req.body.categories,
                uploadedBy: req.user.email,
                publishingCompany: '',
                language: req.body.language,
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
                    res.redirect('/sellers/dashboard')
                }
            });
    })
})

router.get('/edit/:bookID', (req, res) => {
    Book.findOne({ _id: new mongoose.Types.ObjectId(req.params.bookID) }, async (err, book) => {
        if (err) console.log(err);
        let allImgUri = [(book.coverImgUri)]
  
        for (let i = 0; i < book.imageUri.length; i++) {
            allImgUri.push(book.imageUri[i])
        }
        let files=[]
        res.render("sellers/seller_edit", { user: req.user, books: book, files: allImgUri });
    })
})

router.get('/setting', (req, res) => {
    res.render("index/setting", { user: req.user });
})



router.get('/:email', (req, res) => {
    User.findOne({ email: (req.params.email) }, async function (err, user) {
        if (err) throw (err);

        let userAvatar;
        let booksImg = [];

        //search user avatar
        if (user.avatarUri) {
            gfs.files.findOne({ _id: new mongoose.Types.ObjectId(user.avatarUri) }, function (err, file) {
                if (err) throw err
                userAvatar = file;
            })
        } else {
            userAvatar = false
        }
        const books = await Book.find({ uploadedBy: user.email }).sort({ uploadedAt: 'desc' })
            .then()
            .catch()

        let bookCoverImg = [];
        if (books.length === 0) res.render("index/seller_info", { userAvatar: userAvatar, seller: user, user: req.user, books: books, files: bookCoverImg });
        let allImgUri = []
        books.forEach(function (book) {
            allImgUri.push(new mongoose.Types.ObjectId(book.coverImgUri))
        })

        conn.db.collection("book-img.files").find({ _id: { $in: allImgUri } }).toArray((err, files) => {
            if (!files || files.length === 0) {
                res.render("index/seller_info", { userAvatar: userAvatar, seller: user, user: req.user, books: books, files: false });
            } else {
                files.map((file) => {
                    if (file.contentType === 'image/png' || file.contentType === 'image/jpeg') {
                        file.isImage = true
                    } else {
                        file.isImage = false
                    }
                })
                res.render("index/seller_info", { userAvatar: userAvatar, seller: user, user: req.user, books: books, files: files });
            }
        })

        //search all books coverImg

        //send to ejs to display
    })
})
module.exports = router;