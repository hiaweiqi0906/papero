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
const dotenv = require('dotenv')
const upload = require('../utils/multer')
const cloudinary = require("../utils/cloudinary");

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


//store
router.get('/', async (req, res) => {
    const books = await Book.find().sort({ uploadedAt: 'desc' })
        .then()
        .catch()

    let files = [];
    if (books.length === 0) {res.render("index/index", { user: req.user, books: books, files: files });}
    else{
        books.forEach(function(book){
      files.push((book.coverImgUri) )
    })

    res.render("index/index", { user: req.user, books: books, files: files });
    }
    
})

router.get('/view/:bookID', (req, res)=>{
    Book.findOne({ _id: new mongoose.Types.ObjectId(req.params.bookID) }, (err, book) => {
        if (err) console.log(err);
        let files = [book.coverImgUri]
     
        // let allCoverImgUri = [ new mongoose.Types.ObjectId(book.coverImgUri) ]
        for( let i=0; i<book.imageUri.length; i++) {
          files.push(book.imageUri[i])
        }
       res.render("index/info", { user: req.user, books: book, files: files });
        
    })
})

module.exports = router;
