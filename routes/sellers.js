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
const Book = require('../models/Book')

//initialize all required things for read and write img to db
let imageName = []
let gfs
var conn = mongoose.createConnection(db);
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('book-img')
})

//create storage engine
const storage = new GridFsStorage({
    url: db,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                imageName.push(filename)
                const fileInfo = {
                    filename: filename,
                    bucketName: 'book-img'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });


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
        res.render('seller_dashboard')
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

    let files2 = [];
    if (books.length === 0) res.render("seller_dashboard", { user: req.user, books: books, files: files2 });

    //parts to loop to get cover img for each book
    for (let i = 0; i < books.length; i++) {

        gfs.files.find({ filename: books[i].coverImgUri }).toArray((err, files) => {
            if (!files || files.length === 0) {
                files = false;
            } else {
                files.map((file) => {
                    if (file.contentType === 'image/png' || file.contentType === 'image/jpeg') {
                        file.isImage = true
                    } else {
                        file.isImage = false
                    }

                })
            }

            files2[i] = (files)

            if ((i + 1) === books.length) {
                res.render("seller_dashboard", { user: req.user, books: books, files: files2 });
            }
        })
    }
});

/**
 * route: /sellers/upload
 * desc: to allow user to upload
 */
router.get("/upload", ensureAuthenticated, (req, res) => {
    res.render("seller_upload", { user: req.user });
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
}]), (req, res) => {
    //check all info entered
    const coverImage = imageName.shift()

    //put photo uri to book instance
    //put all info to books collection
    const newBook = new Book({
        bookTitle: req.body.title,
        coverImgUri: coverImage,
        imageUri: imageName,
        price: req.body.price,
        description: req.body.description,
        category: req.body.categories,
        uploadedBy: req.user.email,
        publishingCompany: '',
        language: req.body.language,
        isbn: 0,
        coverType: '',
        year: req.body.year,
        quantity: 1
    })
    newBook.save()
        .then() //(book) => console.log(book)
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
        res.render('seller_dashboard')
    } else {
        res.redirect("/users/register");
    }
});



module.exports = router;
