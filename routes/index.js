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
  let skip = (req.params.currentPage - 1) * 12
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
      '$limit': 12
    }
  ]).toArray()

  // result.limit(5)
  res.send(result)
})

router.get('/trySearch', async (req, res) => {
  var date = new Date();
  var inputDate = (roundMinutes(date));//.toISOString()
  const queryPrice={}
  const query = {
     'uploadedAt': { $lte: (inputDate) } 
    // 'category': req.query.category,
    // 'states': req.query.states,
    // 'location': req.query.location,
    // 'bookLanguage': req.query.bookLanguage,
    // 'price': {'$and':[ {$lte: 1400}, {$gte: 10}]}
    // 'price': {$lte: 1400, $gte: 100}
    // $expr: {
      // $and: [{
      //   $gte: ["price", 10]
      // }, {
      //   $lte: ["price", 1400]
      // }]
    // }
  }

  if(req.query.category) query.category = req.query.category
  if(req.query.states) query.states = req.query.states
  if(req.query.location) query.location = req.query.location
  if(req.query.bookLanguage) query.bookLanguage = req.query.bookLanguage
  if(req.query.minPrice) queryPrice.$gte = Number(req.query.minPrice)
  if(req.query.maxPrice) queryPrice.$lte = Number(req.query.maxPrice)
  if(queryPrice!={}) query.price = queryPrice

  console.log(query)
  
  let skip = (req.query.currentPage ? req.query.currentPage : 1 - 1) * 12
  let result = await conn.db.collection("books").aggregate([
    {
      '$search': {
        'index': 'book_index',
        'text': {
          'query': `${req.query.search}`,
          'path': {
            'wildcard': '*'
          },
        }
      },
    }, {
      '$match': query
    }, {
      '$skip': skip
    }, {
      '$limit': 12
    }
  ]).toArray()

  // result.limit(5)
  res.send(result)
})

router.get('/search=:searchResults/page=:currentPage/total=:totalPages', async (req, res) => {
  // Book
  //   .find({$text: {$search: req.params.searchResults}})
  //   .sort({ uploadedAt: 'desc' })
  //   .skip((req.params.currentPage - 1) * 12)
  //   .limit(12)
  //   .exec(function (err, doc) {
  //     if(err) console.log(err)
  //     Book.find({$text: {$search: req.params.searchResults}}, (err, docs)=>{
  //       let totalPages = (Math.ceil(docs.length/12))
  //       res.render("index/search_results", { user: req.user, searchResults: req.params.searchResults, books: doc, currentPage: req.params.currentPage, pages: totalPages });
  //     })      
  //   });    
  let skip = (req.params.currentPage - 1) * 12
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
      '$limit': 12
    }
  ]).toArray()

  res.render("index/search_results", { user: req.user, searchResults: req.params.searchResults, books: result, currentPage: req.params.currentPage, pages: req.params.totalPages });
})

router.get('/search=:searchResults&page=:page', async (req, res) => {

  let skip = (req.params.page - 1) * 12
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
      '$limit': 12
    }
  ]).toArray()
  res.json(result)
  // res.send(result)
  // res.render("index/search_results", { user: req.user, searchResults: req.params.searchResults, books: result, currentPage: req.params.currentPage, pages: req.params.totalPages });
})

router.get('/allBooks&page=:page', (req, res) => {
  Book
    .find()
    .sort({ uploadedAt: 'desc' })
    .skip((req.params.page - 1) * 12)
    .limit(12)
    .exec(function (err, doc) {
      if (err) console.log(err)
      res.json(doc)
    })
})

router.post('/search', async (req, res) => {
  let skip = (req.params.currentPage - 1) * 12
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
  let newLink = '/search=' + req.body.searchbar + '/page=1/total=' + (Math.ceil(result.length / 12))
  res.redirect(newLink)
})


function roundMinutes(date) {

  date.setHours(date.getHours() + Math.round(date.getMinutes() / 60));
  date.setMinutes(0, 0, 0);

  return date;
}

//store
router.get('/', async (req, res) => {
  Book
    .find()
    .sort({ uploadedAt: 'desc' })
    .skip((1 - 1) * 12)
    .limit(12)
    .exec(function (err, doc) {
      if (err) console.log(err)
      res.send(doc)
      // res.render("index/index", { user: req.user, books: doc, files: doc });
    });
})

//send 12 recent uploaded in before 1 hour
router.get('/recentUpload', async (req, res) => {
  var date = new Date();
  var inputDate = roundMinutes(date).toISOString();
  console.log(typeof inputDate, inputDate)
  Book
    .find({ uploadedAt: { $lte: (inputDate) } })
    .sort({ uploadedAt: 'desc' })
    .limit(12)
    .exec(function (err, doc) {
      if (err) console.log(err)
      res.send(doc)
      // res.render("index/index", { user: req.user, books: doc, files: doc });
    });
})

router.get('/recentUpload&page=:pageNumber', async (req, res) => {
  var date = new Date();
  var inputDate = roundMinutes(date).toISOString();
  console.log(typeof inputDate, inputDate)//
  Book
    .find({ 'uploadedAt': { $lte: inputDate } })
    .sort({ uploadedAt: 'desc' })
    .skip((req.params.pageNumber - 1) * 12)
    .limit(12)
    .exec(function (err, doc) {
      if (err) console.log(err)
      res.send(doc)
      // res.render("index/index", { user: req.user, books: doc, files: doc });
    });
})

//send 12 recent uploaded in before 1 hour
router.get('/preferredBook', async (req, res) => {
  var date = new Date();
  var inputDate = roundMinutes(date).toISOString();
  console.log(typeof inputDate, inputDate)
  Book
    .find({ 'uploadedBy': '1111aaa@1111.com', uploadedAt: { $lte: (inputDate) } })
    .sort({ uploadedAt: 'desc' })
    .limit(6)
    .exec(function (err, doc) {
      if (err) console.log(err)
      res.send(doc)
      // res.render("index/index", { user: req.user, books: doc, files: doc });
    });
})

router.get('/preferredBookAll&page=:pageNumber', async (req, res) => {
  var date = new Date();
  var inputDate = roundMinutes(date).toISOString();
  console.log(typeof inputDate, inputDate)
  Book
    .find({ 'uploadedBy': '1111aaa@1111.com', 'uploadedAt': { $lte: inputDate } })
    .sort({ uploadedAt: 'desc' })
    .skip((req.params.pageNumber - 1) * 12)
    .limit(12)
    .exec(function (err, doc) {
      if (err) console.log(err)
      res.send(doc)
      // res.render("index/index", { user: req.user, books: doc, files: doc });
    });
})

router.get('/ads-banner', (req, res) => {

})

router.get('/othersFromSeller-:email', async (req, res) => {
  var date = new Date();
  var inputDate = roundMinutes(date).toISOString();
  console.log(typeof inputDate, inputDate)
  Book
    .find({ 'uploadedBy': req.params.email })
    .sort({ uploadedAt: 'desc' })
    .limit(6)
    .exec(function (err, doc) {
      if (err) console.log(err)
      res.send(doc)
      // res.render("index/index", { user: req.user, books: doc, files: doc });
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
