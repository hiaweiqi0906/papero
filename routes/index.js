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
const User = require('../models/User')
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

router.get('/haha/:searchResults/:currentPage', async (req, res) => {
  let skip = (req.params.currentPage - 1) * 10
  let result = await conn.db.collection("books").aggregate([
    {
      '$search': {
        'index': 'book_index',
        'text': {
          'query': `${req.params.searchResults}`,
          'path': {
            'wildcard': '*'
          }
        }
      },

    }, {
      '$skip': skip
    }, {
      '$limit': 10
    }
  ]).toArray()

  // result.limit(5)
  res.send(result)
})

router.get('/trySearch', (req, res)=>{
})

router.get('/search=:searchResults/page=:currentPage/total=:totalPages', async (req, res) => {
  // Book
  //   .find({$text: {$search: req.params.searchResults}})
  //   .sort({ uploadedAt: 'desc' })
  //   .skip((req.params.currentPage - 1) * 10)
  //   .limit(10)
  //   .exec(function (err, doc) {
  //     if(err) console.log(err)
  //     Book.find({$text: {$search: req.params.searchResults}}, (err, docs)=>{
  //       let totalPages = (Math.ceil(docs.length/10))
  //       res.render("index/search_results", { user: req.user, searchResults: req.params.searchResults, books: doc, currentPage: req.params.currentPage, pages: totalPages });
  //     })      
  //   });    
  let skip = (req.params.currentPage - 1) * 10
  let result = await conn.db.collection("books").aggregate([
    {
      '$search': {
        'index': 'book_index',
        'text': {
          'query': `${req.params.searchResults}`,
          'path': {
            'wildcard': '*'
          }
        }
      },
    }, {
      '$skip': skip
    }, {
      '$limit': 10
    }
  ]).toArray()

  res.render("index/search_results", { user: req.user, searchResults: req.params.searchResults, books: result, currentPage: req.params.currentPage, pages: req.params.totalPages });
})

// router.get('/search=:searchResults', async (req, res) => {
 
//   let skip = (req.params.currentPage - 1) * 10
//   let result = await conn.db.collection("books").aggregate([
//     {
//       '$search': {
//         'index': 'book_index',
//         'text': {
//           'query': `${req.params.searchResults}`,
//           'path': {
//             'wildcard': '*'
//           }
//         }
//       },
//     }
//   ]).toArray()
//   res.json(result)
// // res.send(result)
//   // res.render("index/search_results", { user: req.user, searchResults: req.params.searchResults, books: result, currentPage: req.params.currentPage, pages: req.params.totalPages });
// })

router.get('/search=:searchResults&page=:page', async (req, res) => {
 
  let skip = (req.params.page - 1) * 10
  let result = await conn.db.collection("books").aggregate([
    {
      '$search': {
        'index': 'book_index',
        'text': {
          'query': `${req.params.searchResults}`,
          'path': {
            'wildcard': '*'
          }
        }
      }
    }, {
        '$skip': skip
      }, {
        '$limit': 10
      }
  ]).toArray()
  res.json(result)
// res.send(result)
  // res.render("index/search_results", { user: req.user, searchResults: req.params.searchResults, books: result, currentPage: req.params.currentPage, pages: req.params.totalPages });
})

router.get('/allBooks&page=:page', (req, res)=>{
  Book
        .find()
        .sort({ uploadedAt: 'desc' })
        .skip((req.params.page-1)*10)
        .limit(10)   
        .exec(function (err, doc) {
            if (err) console.log(err)
            res.json(doc)
        })
        
        ;
})

router.post('/search', async (req, res) => {
  let skip = (req.params.currentPage - 1) * 10
  let result = await conn.db.collection("books").aggregate([
    {
      '$search': {
        'index': 'book_index',
        'text': {
          'query': `${req.body.searchbar}`,
          'path': {
            'wildcard': '*'
          }
        }
      },

    }
  ]).toArray()
  let newLink = '/search=' + req.body.searchbar + '/page=1/total=' + (Math.ceil(result.length / 10))
  res.redirect(newLink)
})

//store
router.get('/', async (req, res) => {
  Book
    .find()
    .sort({ uploadedAt: 'desc' })
    .skip((1 - 1) * 10)
    .limit(10)
    .exec(function (err, doc) {
      if (err) console.log(err)
      res.render("index/index", { user: req.user, books: doc, files: doc });
    });
})

router.get('/view/:bookID', (req, res) => {
  // console.log(req.params.bookID)
  // if (req.user) {

  // }
  // Book.findOne({ _id: new mongoose.Types.ObjectId(req.params.bookID) }, (err, book) => {
  //   if (err) console.log(err);
  //   let files = [book.coverImgUri]

  //   // let allCoverImgUri = [ new mongoose.Types.ObjectId(book.coverImgUri) ]
  //   for (let i = 0; i < book.imageUri.length; i++) {
  //     files.push(book.imageUri[i])
  //   }
  //   res.render("index/info", { user: req.user, books: book, files: files });

  // })
  Book.findOne({ _id: new mongoose.Types.ObjectId(req.params.bookID) }, (err, book) => {
    if (err) console.log(err);
    //   res.render("index/info", { user: req.user, books: book, files: files });
    res.send(book)
})
})


router.post('/view/:bookID', (req, res) => {

  let oldFavouriteList = req.user.favouriteUri
  if (!(oldFavouriteList.includes(req.params.bookID))) {
    oldFavouriteList.push(req.params.bookID)
  }
  User.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(req.user._id) }, { favouriteUri: oldFavouriteList })
    .then(() => {
      req.user.favouriteUri = oldFavouriteList
    })
    .catch(err => console.log(err))

  res.redirect(`/view/${req.params.bookID}`)
})

module.exports = router;
