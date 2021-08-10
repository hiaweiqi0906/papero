const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const flash = require('connect-flash');
const session = require('express-session')
const passport = require('passport')

const app = express()
require('./config/passport')(require('passport'))

//mongodb stuff
const db = require('./config/keys').MongoURI

mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
.then((result) => {
    console.log("successfully connected to db");
})
.catch((err) => console.log(err))

const userSchema = new mongoose.Schema({
    name: String,
    password: String
  });

const User = mongoose.model('Users', userSchema);
const testUser = new User({name: "test1234", password:"test1234"})
// testUser.save(function(err){
//     if(err){
//         console.log(err);
//     }
// })


//ejs
app.use(expressLayouts);
app.set("view engine", "ejs");


//body-parser
app.use(express.urlencoded({extended: false}))


//session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//middleware connect flash
app.use(flash())

//global var
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next()
})


//routers
app.use("/", require("./routes/index"))
app.use("/users", require("./routes/users"))


//set up port and listen to port
const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("Server running on port "+ PORT);
})




