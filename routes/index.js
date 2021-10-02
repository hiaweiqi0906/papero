const express = require("express");
const router = express.Router();
const mongoose = require('mongoose')
const Grid = require('gridfs-stream')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const db = require('../config/keys').MongoURI;
const Book = require('../models/Book')
const Ads = require('../models/Ads')
const User = require('../models/User')
const Report = require('../models/Report')
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

router.get('/trySearch', async (req, res) => {
  var date = new Date();
  var inputDate = (roundMinutes(date));
  const queryPrice = {}
  const query = {
    'uploadedAt': { $lte: (inputDate) }
  }

  if (req.query.category) query.category = req.query.category
  if (req.query.states) query.states = req.query.states
  if (req.query.location) query.location = req.query.location
  if (req.query.bookLanguage) query.bookLanguage = req.query.bookLanguage
  if (req.query.minPrice) {
    queryPrice.$gte = Number(req.query.minPrice)
  }
  if (req.query.maxPrice) queryPrice.$lte = Number(req.query.maxPrice)
  if (Object.keys(queryPrice).length != 0) query.price = queryPrice


  let skip = ((req.query.page ? req.query.page : 1) - 1) * 12
  let result
  if (req.query.search != '') {
    result = await conn.db.collection("books").aggregate([
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
  } else {
    result = await conn.db.collection("books").aggregate([{
        '$match': query
      }, {
        '$skip': skip
      }, {
        '$limit': 12
      }
    ]).toArray()
  }
  res.send(result)
})

router.get('/preferredBookSearch', async (req, res) => {
  var date = new Date();
  var inputDate = (roundMinutes(date));
  const queryPrice = {}
  const query = {
    'uploadedAt': { $lte: (inputDate) },
    'uploadedBy': '1111aaa@1111.com'
  }

  if (req.query.category) query.category = req.query.category
  if (req.query.states) query.states = req.query.states
  if (req.query.location) query.location = req.query.location
  if (req.query.bookLanguage) query.bookLanguage = req.query.bookLanguage
  if (req.query.minPrice) {
    queryPrice.$gte = Number(req.query.minPrice)
  }
  if (req.query.maxPrice) queryPrice.$lte = Number(req.query.maxPrice)
  if (Object.keys(queryPrice).length != 0) query.price = queryPrice

  let skip = ((req.query.page ? req.query.page : 1) - 1) * 12
  let result = [];
  if (req.query.search != undefined) {
    result = await conn.db.collection("books").aggregate([
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
  } else {
    result = await conn.db.collection("books").aggregate([
      {
        '$match': query
      }, {
        '$skip': skip
      }, {
        '$limit': 12
      }
    ]).toArray()
  }
  res.send(result)
})

router.get('/uploadedRecentlySearch', async (req, res) => {
  var date = new Date();
  var inputDate = (roundMinutes(date));
  const queryPrice = {}
  const query = {
    'uploadedAt': { $lte: (inputDate) },
  }

  if (req.query.category) query.category = req.query.category
  if (req.query.states) query.states = req.query.states
  if (req.query.location) query.location = req.query.location
  if (req.query.bookLanguage) query.bookLanguage = req.query.bookLanguage
  if (req.query.minPrice) {
    queryPrice.$gte = Number(req.query.minPrice)
  }
  if (req.query.maxPrice) queryPrice.$lte = Number(req.query.maxPrice)
  if (Object.keys(queryPrice).length != 0) query.price = queryPrice

  let skip = ((req.query.page ? req.query.page : 1) - 1) * 12
  let result = [];
  if (req.query.search != undefined) {
    result = await conn.db.collection("books").aggregate([
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
  } else {
    result = await conn.db.collection("books").aggregate([
      {
        '$match': query
      }, {
        '$skip': skip
      }, {
        '$limit': 12
      }
    ]).toArray()
  }
  res.send(result)
})
router.get('/search=:searchResults/page=:currentPage/total=:totalPages', async (req, res) => {
    
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

function roundMinutes(date) {
  date.setHours(date.getHours());
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
    });
})

//send 12 recent uploaded in before 1 hour
router.get('/recentUpload', async (req, res) => {
  var date = new Date();
  var inputDate = roundMinutes(date).toISOString();
  Book
    .find({ uploadedAt: { $lte: (inputDate) } })
    .sort({ uploadedAt: 'desc' })
    .limit(12)
    .exec(function (err, doc) {
      if (err) console.log(err)
      res.send(doc)
    });
})

router.get('/recentUpload&page=:pageNumber', async (req, res) => {
  var date = new Date();
  var inputDate = roundMinutes(date).toISOString();
  Book
    .find({ 'uploadedAt': { $lte: inputDate } })
    .sort({ uploadedAt: 'desc' })
    .skip((req.params.pageNumber - 1) * 12)
    .limit(12)
    .exec(function (err, doc) {
      if (err) console.log(err)
      res.send(doc)
    });
})

//send 12 recent uploaded in before 1 hour
router.get('/preferredBook', async (req, res) => {
  var date = new Date();
  var inputDate = roundMinutes(date).toISOString();
  Book
    .find({ 'uploadedBy': '1111aaa@1111.com', uploadedAt: { $lte: (inputDate) } })
    .sort({ uploadedAt: 'desc' })
    .limit(6)
    .exec(function (err, doc) {
      if (err) console.log(err)
      res.send(doc)
    });
})

router.get('/preferredBookAll&page=:pageNumber', async (req, res) => {
  var date = new Date();
  var inputDate = roundMinutes(date).toISOString();
  Book
    .find({ 'uploadedBy': '1111aaa@1111.com', 'uploadedAt': { $lte: inputDate } })
    .sort({ uploadedAt: 'desc' })
    .skip((req.params.pageNumber - 1) * 12)
    .limit(12)
    .exec(function (err, doc) {
      if (err) console.log(err)
      res.send(doc)
    });
})

router.get('/othersFromSeller-:email', async (req, res) => {
  var date = new Date();
  var inputDate = roundMinutes(date).toISOString();
  Book
    .find({ uploadedBy: req.params.email })
    .sort({ uploadedAt: 'desc' })
    .limit(6)
    .exec(function (err, doc) {
      if (err) console.log(err)
      res.send(doc)
    });
})

router.get('/view/:bookID', (req, res) => {
  Book.findOne({ _id: new mongoose.Types.ObjectId(req.params.bookID) }, (err, book) => {
    if (err) console.log(err);
    User.findOne({ email: book.uploadedBy }, 'firstName lastName location states avatarUri', function (err, user) {
      res.send({ book, user })
    })
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

router.get('/getBanner', (req, res)=>{
  var date = new Date();
  var inputDate = roundMinutes(date).toISOString();
  Ads.find({type: 'Banner', expiredDate: {$gt: inputDate}}, (err, ads)=>{
    if(err) console.log(err)
    else{
      res.send(ads)
    }
  })
})

router.get('/getHorizontalAds', (req, res)=>{
  var date = new Date();
  var inputDate = roundMinutes(date).toISOString();
  Ads.findOne({type: 'Horizontal-ads', expiredDate: {$gt: inputDate}}, (err, ads)=>{
    if(err) console.log(err)
    else{
      res.send({uri: ads.imgUri})
    }
  })
})

router.post('/reportBook&id=:id', (req, res)=>{
  const newReport = new Report({
    type: 'Book',
    reportId: req.params.id,
    comment: req.body.details,
    category: 'Book',
    date: new Date(),
    settled: false
  })

  newReport.save()
  .then( ()=> {
    res.status(200)
  })
  .catch(err => console.log(err))

})

router.post('/reportSeller&id=:id', (req, res)=>{
  const newReport = new Report({
    type: 'Seller',
    reportId: req.params.id,
    comment: req.body.details,
    category: 'Seller',
    date: new Date(),
    settled: false
  })

  newReport.save()
  .then( ()=> {
    res.status(200)
  })
  .catch(err => console.log(err))
})

router.get('/getVerticalAds', (req, res)=>{
  var date = new Date();
  var inputDate = roundMinutes(date).toISOString();
  Ads.findOne({type: 'Vertical-ads', expiredDate: {$gt: inputDate}}, (err, ads)=>{
    if(err) console.log(err)
    else{
      if(ads != null)
        res.send({uri: ads.imgUri})
    }
  })
})

module.exports = router;