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
// router.get("/", (req, res) => { res.render("index/index") });//index.ejs

//store
router.get('/', async (req, res) => {
    const books = await Book.find().sort({ uploadedAt: 'desc' })
        .then()
        .catch()
    //   })
    let files2 = [];
    if (books.length === 0) res.render("index/index", { user: req.user, books: books, files: files2 });
    for (let i = 0; i < books.length; i++) {
        conn.db.collection("book-img.files").findOne({ _id: new mongoose.Types.ObjectId(books[i].coverImgUri) }, function (err, file) {
            if (!file) file = false
            else {
                if (file.contentType === 'image/png' || file.contentType === 'image/jpeg') {
                    file.isImage = true
                } else {
                    file.isImage = false
                }
            }
            files2.push(file)
            if ((i + 1) === books.length) {
                res.render("index/index", { user: (req.user)? req.user: '', books: books, files: files2 });
            }
        });
    }
})

router.get('/view/:bookID', (req, res)=>{
    Book.findOne({ _id: new mongoose.Types.ObjectId(req.params.bookID) }, (err, book) => {
        if (err) console.log(err);
        let files = []
        
        let allid = [ new mongoose.Types.ObjectId(book.coverImgUri) ]
        for( let i=0; i<book.imageUri.length; i++) {
            allid.push(book.imageUri[i])
        }

       
        conn.db.collection("book-img.files").find({ _id: { $in: allid } }).toArray((err, files) => {
            if (!files || files.length === 0) {
                res.render("index/info", { user: req.user, books: book, files: false });
            } else {
              files.map((file) => {
                if (file.contentType === 'image/png' || file.contentType === 'image/jpeg') {
                  file.isImage = true
                } else {
                  file.isImage = false
                }
              })
              res.render("index/info", { user: req.user, books: book, files: files });
            }
          })

        // conn.db.collection("book-img.files").findOne({ _id: new mongoose.Types.ObjectId(book.coverImgUri) }, function (err, file) {
        //     console.log('here1')
        //     if (!file) file = false
        //     else {
        //         if (file.contentType === 'image/png' || file.contentType === 'image/jpeg') {
        //             file.isImage = true
        //         } else {
        //             file.isImage = false
        //         }
        //     }
        //     files.push(file)
        //     // res.send(files)
        //     if (book.imageUri.length === 0) {
        //         res.render("index/info", { user: req.user, books: book, files: files });
        //     }
        // });
        // if (book.imageUri.length != 0) {
        //     console.log('here2')

        //     for (let i = 0; i < book.imageUri.length; i++) {

        //         conn.db.collection("book-img.files").findOne({ _id: new mongoose.Types.ObjectId(book.imageUri[i]) }, function (err, file) {
        //             if (!file) file = false
        //             else {
        //                 if (file.contentType === 'image/png' || file.contentType === 'image/jpeg') {
        //                     file.isImage = true
        //                 } else {
        //                     file.isImage = false
        //                 }
        //             }
        //             files.push(file)
        //             if (((i + 1) === book.imageUri.length)) {
        //                 if(files.length === (book.imageUri+1)){
        //                     conn.db.collection("book-img.files").findOne({ _id: new mongoose.Types.ObjectId(book.coverImgUri) }, function (err, file) {
        //                         console.log('here1')
        //                         if (!file) file = false
        //                         else {
        //                             if (file.contentType === 'image/png' || file.contentType === 'image/jpeg') {
        //                                 file.isImage = true
        //                             } else {
        //                                 file.isImage = false
        //                             }
        //                         }
        //                         files.push(file)
        //                         // res.send(files)
        //                         if (book.imageUri.length === 0) {
        //                             res.render("index/info", { user: req.user, books: book, files: files });
        //                         }
        //                     });
        //                 }else{
        //                     res.render("index/info", { user: req.user, books: book, files: files });
        //                 }
                        
        //             }
        //         });
        //     }
        // }
    })
})

module.exports = router;
