const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const flash = require('connect-flash');
const session = require('express-session')
const passport = require('passport')
const path = require('path')
const cors = require('cors')
const methodOverride = require('method-override')
const dotenv = require('dotenv')

dotenv.config()


const app = express()
// app.use(bodyParser.json())//{ limit: "50mb" }
app.use(express.json());
app.use(express.urlencoded({ extended: true }));//{limit: '50mb', , parameterLimit: 50000}

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


//session middleware
app.use(session({
  secret: 'keyboard cat.',
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

app.use(express.json())
app.use(methodOverride('_method'))

//routers
app.use("/", require("./routes/index"))
app.use("/users", require("./routes/users"))
app.use('/sellers', require('./routes/sellers'))

//set up port and listen to port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
})














