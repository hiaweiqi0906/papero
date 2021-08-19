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
const dotenv = require('dotenv')
const upload = require('./utils/multer')
const cloudinary = require("./utils/cloudinary");


dotenv.config()


const app = express()
app.use(express.json())
require('./config/passport')(require('passport'))

//mongodb stuff
const db = require('./config/keys').MongoURI;
const { connect, options } = require('./routes/index');


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

app.get('/testupload', (req, res) => {
  res.render('testupload')
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
    let results=[]
    let imgUri = []
    for(let i=0; i<imgID.length; i++){
      var result = await (cloudinary.uploader.upload(imgID[i].path))
      imgUri.push(result.secure_url)
      results.push(result)
    }
    console.log(results)
    console.log(imgUri);
    res.send(`<img src="${imgUri[0]}"/>`)
    //console.log(files.coverImg)
    // for (const file of files) {
    //   const { path } = file;
    //   const newPath = await cloudinary.uploader.upload(path);
    //   urls.push(newPath);
    // }

    // const product = new Product({
    //   name: req.body.name,
    //   productImages: urls.map(url => url.res),
    // });
    // console.log(urls)
    // Upload image to cloudinary
    // let results = []
    // req.files.forEach((file)=>{
    //   results.push(await (cloudinary.uploader.upload(file.path)))
    // })
    // const result = await cloudinary.uploader.upload(req.files.path);

    // // Create new user
    // let user = new User ({
    //   name: req.body.name,
    //   avatar: result.secure_url,
    //   cloudinary_id: result.public_id,
    // });
    // // Save user
    // await user.save();
    // res.json(user);
    // console.log(results)
  } catch (err) {
    console.log(err);
  }
});
//set up port and listen to port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
})














