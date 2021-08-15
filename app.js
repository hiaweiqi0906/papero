const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const flash = require('connect-flash');
const session = require('express-session')
const MongoDBSession = require('connect-mongodb-session')(session)
const passport = require('passport')
const path = require('path')
const crypto = require('crypto')
const multer = require('multer')
const { GridFsStorage } = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')

const app = express()
require('./config/passport')(require('passport'))

//mongodb stuff
const db = require('./config/keys').MongoURI;
const { connect, options } = require('./routes/index');

let gfs
var conn = mongoose.createConnection(db);
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('book-img')
  // all set!
})

let imageName = []

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


//promise
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then((result) => {
    console.log("successfully connected to db");
  })
  .catch((err) => console.log(err))

const store = new MongoDBSession({
  uri: 'mongodb+srv://yijoetan:yijoetan123@cluster0.rexmz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  collection: 'mySessions',
})

//ejs
app.use(expressLayouts);
app.set("view engine", "ejs");


//body-parser
app.use(express.urlencoded({ extended: false }))


//session middleware
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}))

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//middleware connect flash
app.use(flash())

//global middleware
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next()
})

app.use(bodyParser.json())
app.use(methodOverride('_method'))

//routers
app.use("/", require("./routes/index"))
app.use("/users", require("./routes/users"))
app.use('/sellers', require('./routes/sellers'))
app.use('/forums', require('./routes/forums'))

app.delete('/files/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'book-img' }, (err, gridStore) => {
    if (err) return res.status(404).json({ err: err })
    res.redirect('/upload')
  })
})

app.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ _id: new mongoose.Types.ObjectId(req.params.filename) }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      })
    }
    //check is img
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      //read output to browser
      var readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({ err: 'Not an image' })
    }
  })
})

app.get('/imageId/:filename', (req, res) => {
  gfs.files.findOne({ _id: (req.params.filename) }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      })
    }
    //check is img
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      //read output to browser
      var readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({ err: 'Not an image' })
    }
  })
})

//set up port and listen to port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
})














