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

const Book = require('../models/Book')
router.use(express.urlencoded({ extended: false }))
router.use(bodyParser.json())
router.use(methodOverride('_method'))

let imageName = []
let gfs
var conn = mongoose.createConnection(db);
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('book-img')
    // all set!
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


//welcome page
router.get("/", (req, res) => { res.render("index") });//index.ejs

//store
router.get('/store', async (req, res) => {
    const books = await Book.find().sort({ uploadedAt: 'desc' })
        .then()
        .catch()
    //   })
    let files2 = [];
    if (books.length === 0) res.render("store", { user: req.user, books: books, files: files2 });
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
                res.render("store", { user: req.user, books: books, files: files2 });
            }
        })



    }

})

module.exports = router;
