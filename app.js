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
const cors = require('cors')
const { GridFsStorage } = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const upload = require('./utils/multer')
const cloudinary = require("./utils/cloudinary");
const Article = require('./models/article')
const Book = require('./models/Book')
const nodemailer = require('nodemailer')
// const MongoStore = require('connect-mongo')

dotenv.config()


const app = express()
app.enable('trust proxy'); // add this line

app.use(express.json())
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(cors({
  origin: "http://localhost:3000", // <-- location of the react app were connecting to
  credentials: true,
}))
require('./config/passport')(require('passport'))

//mongodb stuff
const db = require('./config/keys').MongoURI;
const { connect, options } = require('./routes/index');
const User = require('./models/User');


let imageName = []

//promise
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then((result) => {
    console.log("successfully connected to db");
  })
  .catch((err) => console.log(err))
//ejs
app.use(expressLayouts);
app.set("view engine", "ejs");



//body-parser
app.use(express.urlencoded({ extended: true }))

//session middleware
app.use(session({
  secret: 'keyboard cat.',
  resave: true,
  saveUninitialized: true,
  proxy: true, // add this line
  cookie: {
    // secure: true,
    maxAge: 1000 * 60 * 60 * 24,
    // store: new MongoStore({ mongoUrl: db })
    // store: MongoStore.create({ mongoUrl: db })
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

app.use(express.json())
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

app.get('/testupload', (req, res) => {
  res.render('testupload')
})

app.get('/searchh/page=:pageNum/searchResults=:results', (req, res)=>{
  console.log(req.params)
})

app.post('/test', async (req, res) => {
  
const output = `
<p>New Request</p>
<ul>
<li>Email: ${req.body.email}</li>
<li>Password: ${req.body.password}</li>
</ul>
`

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "mail.google.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'hiaweiqi@gmail.com', // generated ethereal user
      pass: 'hiaweiqi', // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Wei Qi" <hiaweiqi@gmail.com>', // sender address
    to: "hiaweiqi@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: output, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

  res.render('test')
})

app.get('/test', async (req, res) => {
  res.render('test')

})

app.post('/testupload', upload.fields([{ //upload pic to db
  name: 'coverImg', maxCount: 1
}, {
  name: 'img1', maxCount: 1
}, {
  name: 'img2', maxCount: 1
}, {
  name: 'img3', maxCount: 1
}]), async (req, res) => {
  try {
    const urls = [];
    const files = req.files;
    let imgID = []
    if (req.files.coverImg) {
      imgID.push(req.files.coverImg[0]);
    }
    if (req.files.img1) {
      imgID.push(req.files.img1[0]);
    }
    if (req.files.img2) {
      imgID.push(req.files.img2[0]);
    }
    if (req.files.img3) {
      imgID.push(req.files.img3[0]);
    }
    console.log(imgID)
    let results = []
    let imgUri = []
    for (let i = 0; i < imgID.length; i++) {
      var result = await (cloudinary.uploader.upload(imgID[i].path))
      imgUri.push(result.secure_url)
      results.push(result)
    }
    console.log(results)
    console.log(imgUri);
    res.send(`<img src="${imgUri[0]}"/>`)

  } catch (err) {
    console.log(err);
  }
});
//set up port and listen to port
const PORT = process.env.PORT || 5000;

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port " + PORT);
})














