// const express = require('express')
// const expressLayouts = require('express-ejs-layouts')
// const mongoose = require('mongoose')
// const flash = require('connect-flash');
// const session = require('express-session')
// const MongoDBSession = require('connect-mongodb-session')(session)
// const passport = require('passport')
// const path = require('path')
// const crypto = require('crypto')
// const multer = require('multer')
// const cors = require('cors')
// const { GridFsStorage } = require('multer-gridfs-storage')
// const Grid = require('gridfs-stream')
// const methodOverride = require('method-override')
// const bodyParser = require('body-parser')
// const dotenv = require('dotenv')
// const upload = require('./utils/multer')
// const cloudinary = require("./utils/cloudinary");
// const Article = require('./models/article')
// const Book = require('./models/Book')
// const nodemailer = require('nodemailer')
// // const MongoStore = require('connect-mongo')

// dotenv.config()


// const app = express()
// app.enable('trust proxy'); // add this line
// app.set('trust proxy', 1) // trust first proxy

// app.use(express.json())
// app.use('/public', express.static(path.join(__dirname, 'public')))
// app.use(cors({
//   origin: "http://localhost:3000", // <-- location of the react app were connecting to
//   credentials: true,
// }))
// require('./config/passport')(require('passport'))

// //mongodb stuff
// const db = require('./config/keys').MongoURI;
// const { connect, options } = require('./routes/index');
// const User = require('./models/User');


// let imageName = []

// //promise
// mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
//   .then((result) => {
//     console.log("successfully connected to db");
//   })
//   .catch((err) => console.log(err))
// //ejs
// app.use(expressLayouts);
// app.set("view engine", "ejs");



// //body-parser
// app.use(express.urlencoded({ extended: true }))

// //session middleware
// app.use(session({
//   secret: 'keyboard cat.',
//   secure: true,
//   resave: true,
//   saveUninitialized: true,
//   proxy: true, // add this line
//   cookie: {
//     secure: true,
//     maxAge: 1000 * 60 * 60 * 24,
//     // store: new MongoStore({ mongoUrl: db })
//     // store: MongoStore.create({ mongoUrl: db })
//   }
// }))

// //passport middleware
// app.use(passport.initialize());
// app.use(passport.session());

// //middleware connect flash
// app.use(flash())

// //global middleware
// app.use(function (req, res, next) {
//   res.locals.success_msg = req.flash('success_msg');
//   res.locals.error_msg = req.flash('error_msg');
//   res.locals.error = req.flash('error');
//   next()
// })

// app.use(express.json())
// app.use(methodOverride('_method'))

// //routers
// app.use("/", require("./routes/index"))
// app.use("/users", require("./routes/users"))
// app.use('/sellers', require('./routes/sellers'))
// app.use('/forums', require('./routes/forums'))

// app.delete('/files/:id', (req, res) => {
//   gfs.remove({ _id: req.params.id, root: 'book-img' }, (err, gridStore) => {
//     if (err) return res.status(404).json({ err: err })
//     res.redirect('/upload')
//   })
// })

// app.get('/image/:filename', (req, res) => {
//   gfs.files.findOne({ _id: new mongoose.Types.ObjectId(req.params.filename) }, (err, file) => {
//     if (!file || file.length === 0) {
//       return res.status(404).json({
//         err: 'No files exist'
//       })
//     }
//     //check is img
//     if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
//       //read output to browser
//       var readstream = gfs.createReadStream(file.filename);
//       readstream.pipe(res);
//     } else {
//       res.status(404).json({ err: 'Not an image' })
//     }
//   })
// })

// app.get('/imageId/:filename', (req, res) => {
//   gfs.files.findOne({ _id: (req.params.filename) }, (err, file) => {
//     if (!file || file.length === 0) {
//       return res.status(404).json({
//         err: 'No files exist'
//       })
//     }
//     //check is img
//     if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
//       //read output to browser
//       var readstream = gfs.createReadStream(file.filename);
//       readstream.pipe(res);
//     } else {
//       res.status(404).json({ err: 'Not an image' })
//     }
//   })
// })

// app.get('/testupload', (req, res) => {
//   res.render('testupload')
// })

// app.get('/searchh/page=:pageNum/searchResults=:results', (req, res)=>{
//   console.log(req.params)
// })

// app.post('/test', async (req, res) => {

// const output = `
// <p>New Request</p>
// <ul>
// <li>Email: ${req.body.email}</li>
// <li>Password: ${req.body.password}</li>
// </ul>
// `

//   // create reusable transporter object using the default SMTP transport
//   let transporter = nodemailer.createTransport({
//     host: "mail.google.com",
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: 'hiaweiqi@gmail.com', // generated ethereal user
//       pass: 'hiaweiqi', // generated ethereal password
//     },
//   });

//   // send mail with defined transport object
//   let info = await transporter.sendMail({
//     from: '"Wei Qi" <hiaweiqi@gmail.com>', // sender address
//     to: "hiaweiqi@gmail.com", // list of receivers
//     subject: "Hello ✔", // Subject line
//     text: "Hello world?", // plain text body
//     html: output, // html body
//   });

//   console.log("Message sent: %s", info.messageId);
//   // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

//   // Preview only available when sending through an Ethereal account
//   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
//   // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

//   res.render('test')
// })

// app.get('/test', async (req, res) => {
//   res.render('test')

// })

// app.post('/testupload', upload.fields([{ //upload pic to db
//   name: 'coverImg', maxCount: 1
// }, {
//   name: 'img1', maxCount: 1
// }, {
//   name: 'img2', maxCount: 1
// }, {
//   name: 'img3', maxCount: 1
// }]), async (req, res) => {
//   try {
//     const urls = [];
//     const files = req.files;
//     let imgID = []
//     if (req.files.coverImg) {
//       imgID.push(req.files.coverImg[0]);
//     }
//     if (req.files.img1) {
//       imgID.push(req.files.img1[0]);
//     }
//     if (req.files.img2) {
//       imgID.push(req.files.img2[0]);
//     }
//     if (req.files.img3) {
//       imgID.push(req.files.img3[0]);
//     }
//     console.log(imgID)
//     let results = []
//     let imgUri = []
//     for (let i = 0; i < imgID.length; i++) {
//       var result = await (cloudinary.uploader.upload(imgID[i].path))
//       imgUri.push(result.secure_url)
//       results.push(result)
//     }
//     console.log(results)
//     console.log(imgUri);
//     res.send(`<img src="${imgUri[0]}"/>`)

//   } catch (err) {
//     console.log(err);
//   }
// });
// //set up port and listen to port
// const PORT = process.env.PORT || 5000;

// app.listen(process.env.PORT || 5000, () => {
//   console.log("Server running on port " + PORT);
// })














//jshint esversion:6
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
const findOrCreate = require('mongoose-findorcreate')
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const session = require('express-session')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./models/User')
const cors = require('cors')
let cookieParser = require('cookie-parser')

// const bcrypt = require('bcrypt')
// const saltRounds = 10
// const md5 = require('md5')
// const encrypt = require('mongoose-encryption')

const app = express()



app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:3000", // <-- location of the react app were connecting to
  credentials: true,
}))

app.enable('trust proxy'); // add this line
// app.set('trust proxy', 1) // trust first proxy

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(
//   jwt({
//     secret: process.env.TOKEN_SECRET,
//     getToken: req => req.cookies.authToken
//   })
// );
function verify(req, res, next) {
  const token = req.cookies.authToken
  if (!token) return res.status(401).send('Access Denied')
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET)
    req.user = verified;
    next()
  } catch (err) {
    res.status(400).send('Invalid Token')
  }
}

app.get('/printjwt', verify, (req, res) => {
  console.log(req.cookies, req.user)
  res.send(req.user)
  
})
app.use(session({
  // store: MongoStore.create({ mongoUrl: db }),
  secret: process.env.TOKEN_SECRET,
  resave: true,
  saveUninitialized: true,
  proxy: true, // add this line
  cookie: {
    sameSite:'none',
    secure: true,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    // store: new MongoStore({ mongoUrl: db })
    
  }
}))

app.use(passport.initialize())
app.use(passport.session())

const db = require('./config/keys').MongoURI;
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("successfully connected to db");
  })
  .catch((err) => console.log(err))


// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  return done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    return done(err, user);
  });
});

passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    //Match user
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          return done(null, false, { message: "That email is not registered" });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Password incorrect" });
          }
        });
      })
      .catch((err) => console.log(err));
  })
);

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
  function (accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      if (err) console.log(err)
      return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/secrets"
},
  function (accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      if (err) console.log(err);
      return cb(err, user);
    });
  }
));

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }))

app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get('/auth/facebook',
  passport.authenticate('facebook'));


app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get('/login', (req, res) => {
  res.render('login')
})

app.get('/isLoggedIn', verify, (req, res) => {

  console.log(req.session)
  res.send(req.user)
})

app.post('/login', (req, res) => {

  const user = new User({
    email: req.body.username,
    password: req.body.password
  })

  passport.authenticate('local')(req, res, () => {
    console.log(req.session)
    //create token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
    console.log('process.env.TOKEN_SECRET', process.env.TOKEN_SECRET)
    res.cookie("authToken", token, { secure: true, sameSite: 'none', expires: new Date(Date.now() + 99999), httpOnly: true }); //signed: true, 
    res.header('authToken', token).send(token)
    // res.redirect('/secrets')
  })


  // req.login(user, (err) => {
  //     if (err) console.log(err)
  //     else {
  //         passport.authenticate('local')(req, res, () => {
  //             res.send('ok')
  //             // res.redirect('/secrets')
  //         })
  //     }
  // })
  // User.findOne({email: req.body.username}, (err, user)=>{
  //     if(err) console.log(err);
  //     else{
  //         if(user) {
  //             bcrypt.compare(req.body.password, user.password, function(err, result) {
  //                 err ? console.log(err) : console.log();
  //                 result ? res.render('secrets') : res.render('login')
  //             });

  //         }
  //         else res.render('login')
  //     }
  // })
})

app.get('/register', (req, res) => {
  res.render('register')
})

app.get('/logout', (req, res) => {
  req.logout()
  res.clearCookie('authToken');

  res.redirect('/')
})

app.get('/secrets', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('secrets')
  } else {
    res.redirect('/login')
  }
})

app.get('/submit', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('submit')
  } else {
    res.redirect('/login')
  }
})

app.post('/submit', (req, res) => {
  const submittedSecret = req.body.secret;
  User.findById(req.user.id, (err, user) => {
    if (err) console.log(err);
    if (user) {

    }
  })
  console.log(req.user);
})

app.post('/register', (req, res) => {

  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err)
      res.redirect('/register')
    } else {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/secrets')
      })
    }
  })
  // const {username, password} = req.body
  // bcrypt.hash(password, saltRounds, function(err, hash) {
  //     // Store hash in your password DB.
  //     const newUser = new User({email: username, password: hash})
  //     newUser.save()
  //     .then(()=>res.render('secrets'))
  //     .catch(err =>console.log(err))
  // });
})

app.listen(process.env.PORT || 4000, () => {
  console.log("server running on port 4000");
})