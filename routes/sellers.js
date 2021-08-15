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

    let files2 = [];
    if (books.length === 0) res.render("sellers/seller_dashboard", { user: req.user, books: books, files: files2 });

    //parts to loop to get cover img for each book
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
            while(files2.length === 0){
                conn.db.collection("book-img.files").findOne({ _id: new mongoose.Types.ObjectId(books[i].coverImgUri) }, function (err, file) {
                    if (!file) file = false
                    else {
                        if (file.contentType === 'image/png' || file.contentType === 'image/jpeg') {
                            file.isImage = true
                        } else {
                            file.isImage = false
                        }
                    }
                    files2.push(file)})
            }
            if ((i + 1) === books.length) {
                res.render("sellers/seller_dashboard", { user: req.user, books: books, files: files2 });
            }
        });
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
}]), (req, res) => {

    let imgID = []
    if (req.files.coverImg) {
        imgID.push(req.files.coverImg[0].id);
    }
    if (req.files.img1) {
        imgID.push(req.files.img1[0].id);
    }
    if (req.files.img2) {
        imgID.push(req.files.img2[0].id);
    }
    if (req.files.img3) {
        imgID.push(req.files.img3[0].id);
    }
    //check all info entered
    const coverImage = imgID.shift()


    //put photo uri to book instance
    //put all info to books collection
    const newBook = new Book({
        bookTitle: req.body.title,
        coverImgUri: coverImage,
        imageUri: imgID,
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
}]), (req, res) => {

    Book.findOne({ _id: new mongoose.Types.ObjectId(req.params.bookID) }, (err, book) => {

        if (err) console.log(err);
        let removeId = []
        let imgID = []
        if (req.files.coverImg) {
            imgID.push(req.files.coverImg[0].id);
            removeId.push(new mongoose.Types.ObjectId(book.coverImgUri));
        } else {
            imgID.push(book.coverImgUri);
        }

        if (req.files.img1) {
            imgID.push(req.files.img1[0].id);
            if (book.imageUri[0]) removeId.push(book.imageUri[0]);
        } else {
            if (book.imageUri[0]) imgID.push(book.imageUri[0]);
        }

        if (req.files.img2) {
            imgID.push(req.files.img2[0].id);
            if (book.imageUri[1]) removeId.push(book.imageUri[1]);
        } else {
            if (book.imageUri[1]) imgID.push(book.imageUri[1]);
        }

        if (req.files.img3) {
            imgID.push(req.files.img3[0].id);
            if (book.imageUri[2]) removeId.push(book.imageUri[2]);
        } else {
            if (book.imageUri[2]) imgID.push(book.imageUri[2]);
        }
        gfs.files.deleteMany({ _id: { $in: removeId } })
        
        //check all info entered
        const coverImage = imgID.shift()
        Book.updateOne({ _id: new mongoose.Types.ObjectId(req.params.bookID) },
            {
                bookTitle: req.body.title,
                coverImgUri: coverImage,
                imageUri: imgID,
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
        let allid = [ new mongoose.Types.ObjectId(book.coverImgUri) ]
        for( let i=0; i<book.imageUri.length; i++) {
            allid.push(book.imageUri[i])
        }

        conn.db.collection("book-img.files").find({ _id: { $in: allid } }).toArray((err, files) => {
            if (!files || files.length === 0) {
                res.render("sellers/seller_edit", { user: req.user, books: book, files: false });
            } else {
              files.map((file) => {
                if (file.contentType === 'image/png' || file.contentType === 'image/jpeg') {
                  file.isImage = true
                } else {
                  file.isImage = false
                }
              })
              res.render("sellers/seller_edit", { user: req.user, books: book, files: files });
            }
          })
        let files = []
        
    })
})

module.exports = router;