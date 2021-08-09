const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')

const app = express()


//mongodb stuff
const db = require('./config/keys').MongoURI

mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
.then((result) => {
    console.log("success");
})
.catch((err) => console.log(err))

const userSchema = new mongoose.Schema({
    name: String,
    password: String
  });

const User = mongoose.model('Users', userSchema);
const testUser = new User({name: "test1234", password:"test1234"})
testUser.save(function(err){
    if(err){
        console.log(err);
    }
})
//ejs
app.use(expressLayouts);
app.set("view engine", "ejs");


//routers
app.use("/", require("./routes/index"))
app.use("/users", require("./routes/users"))


//set up port and listen to port
const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("Server running on port "+ PORT);
})




