// const express = require('express')
// const router = express.Router()
// const bcrypt = require('bcryptjs')
// const passport = require('passport')
// const User = require('../models/User')
// const upload = require('../utils/multer')
// const cloudinary = require("../utils/cloudinary");
const jwt = require('jsonwebtoken')
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require('passport')
const mongoose = require('mongoose')
const crypto = require('crypto')
const User = require('../models/User')
const Book = require('../models/Book')
const nodemailer = require('nodemailer')
const Token = require("../models/token");


router.get('/logout', (req, res) => {
    req.logout()
    res.json({ msg: 'logged out' })
})

router.get('/checkIsLoggedIn', (req, res) => {

    if (!req.headers.authorization) res.sendStatus(400)
    try {
        tokenString = req.headers.authorization.split(' ')
        const verified = jwt.verify(tokenString[1], process.env.TOKEN_SECRET)
        req.user = verified;
        res.sendStatus(200)
    } catch (err) {
        res.sendStatus(400)
    }
})

router.get('/retrieveInfo', (req, res) => {
    if (!req.headers.authorization) res.sendStatus(400)
    try {
        tokenString = req.headers.authorization.split(' ')
        const verified = jwt.verify(tokenString[1], process.env.TOKEN_SECRET)
        requestedUserId = verified._id;
        User.findById(requestedUserId)
            .then(user => {
                const cleanUser = user.toObject()
                res.send(cleanUser)
            })
            .catch(err => console.log(err))

    } catch (err) {
        res.sendStatus(400)
    }
})

router.get('/retrieveOthersInfo/:id', (req, res) => {

    try {

        User.findById(req.params.id)
            .then(user => {
                const cleanUser = user.toObject()
                delete cleanUser.password
                res.send(cleanUser)
            })
            .catch(err => console.log(err))

    } catch (err) {
        res.sendStatus(400)
    }
})

router.post('/register', (req, res) => {
    User.findOne({
        email: req.body.email
    })
        .then((user) => {
            if (!user) {
                const newUser = new User({
                    firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, password: req.body.password
                })
                bcrypt.genSalt(10, function (err, salt) {
                    if (err) throw err

                    bcrypt.hash(newUser.password, salt, function (err, hash) {
                        if (err) throw err

                        newUser.password = hash
                        newUser.save()
                            .then((users) => {
                                res.json({msg: "registered"})
                            })
                            .catch(err => console.log(err))
                    });
                });
            } else {
                res.json({ msg: "userexist" })
            }
        })
        .catch(err => console.log(err))
})

router.post('/changePassword', (req, res) => {
    if (!req.headers.authorization) res.sendStatus(400)
    try {
        tokenString = req.headers.authorization.split(' ')
        const verified = jwt.verify(tokenString[1], process.env.TOKEN_SECRET)
        requestedUserId = verified._id;
        User.findById(requestedUserId)
            .then(user => {
                //check 3 new fields entered?
                const oldPassword = req.body.oldPassword
                const newPassword1 = req.body.newPassword1

                //get old password from db
                //compare old password
                bcrypt.compare(oldPassword, user.password, function (err, result) {
                    // if result==true
                    if (result) {
                        bcrypt.genSalt(10, function (err, salt) {
                            if (err) throw err

                            bcrypt.hash(newPassword1, salt, function (err, hash) {
                                if (err) throw err

                                User.findOneAndUpdate({ email: user.email }, {
                                    password: hash
                                }, (err, doc) => {
                                    if (err) throw err
                                    else {
                                        user.password = hash
                                        res.send({ msg: 'Password Changed' })
                                    }
                                })
                            });
                        });
                    } else {
                        res.send({ msg: 'Password Incorrect' })
                    }
                });
            })
            .catch(err => console.log(err))

    } catch (err) {
        res.sendStatus(400)
    }
})

router.post('/resetPassword', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.status(400).send("user with given email doesn't exist");

        let token = await Token.findOne({ userId: user._id });
        if (!token) {
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        const link = `http://localhost:3000/resetPassword/${user._id}/${token.token}`;
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'papero2021malaysia@gmail.com',
                pass: 'gw1p82ndlf'
            }
        });

        var mailOptions = {
            from: 'papero2021malaysia@gmail.com',
            to: user.email,
            subject: 'Password Reset',
            text: `${link}`
            // html: '<h1>Hi Smartherd</h1><p>Your Messsage</p>'        
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                res.send('Email sent')
            }
        });
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
})

router.post("/resetPassword/:userId/:token", async (req, res) => {
    try {

        const user = await User.findById(req.params.userId);
        if (!user) return res.status(400).send("invalid link or expired");

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) return res.status(400).send("Invalid link or expired");

        bcrypt.genSalt(10, function (err, salt) {
            if (err) throw err

            bcrypt.hash(req.body.password, salt, async function (err, hash) {
                if (err) throw err

                user.password = hash
                await user.save()
                await token.delete();
                res.status(200).send("successful");
                    
            });
        });


    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
});

router.post('/login', (req, res, next) => {

    
    passport.authenticate('local')(req, res, () => {
        const token = jwt.sign({ _id: req.user._id, firstName: req.user.firstName, lastName: req.user.lastName }, process.env.TOKEN_SECRET)
        res.cookie("authToken", token, { httpOnly: true, secure: true, sameSite: 'none', expires: new Date(Date.now() + 99999) }); //signed: true,, httpOnly: true  
        res.send({ authToken: token })
        
    })
})

router.get('/favourites&page=:page', (req, res) => {
    if (!req.headers.authorization) res.sendStatus(400)
    try {
        tokenString = req.headers.authorization.split(' ')
        const verified = jwt.verify(tokenString[1], process.env.TOKEN_SECRET)
        requestedUserId = verified._id;
        User.findById(requestedUserId)
            .then(user => {
                Book.find({ _id: { $in: user.favouriteUri } })
                    .skip((req.params.page - 1) * 10)
                    .limit(10)
                    .exec(function (err, docs) {
                        res.json(docs)
                    })
            })
            .catch(err => console.log(err))

    } catch (err) {
        res.sendStatus(400)
    }
})

router.post('/removeFavourites&id=:bookId', (req, res) => {
    if (!req.headers.authorization) res.sendStatus(400)
    try {
        tokenString = req.headers.authorization.split(' ')
        const verified = jwt.verify(tokenString[1], process.env.TOKEN_SECRET)
        requestedUserId = verified._id;
        User.findById(requestedUserId)
            .then(user => {
                let oldFavouriteList = user.favouriteUri
                let result = oldFavouriteList.filter(item => item != req.params.bookId)
                User.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(requestedUserId) }, { favouriteUri: result })
                    .then((user) => {
                        res.sendStatus(200)
                    })
                    .catch(err => console.log(err))
            })
            .catch(err => console.log(err))

    } catch (err) {
        res.sendStatus(400)
    }

})

router.get('/addFavourites&id=:bookId', (req, res) => {
    if (!req.headers.authorization) res.sendStatus(400)
    else {
        try {
            tokenString = req.headers.authorization.split(' ')
            const verified = jwt.verify(tokenString[1], process.env.TOKEN_SECRET)
            requestedUserId = verified._id;
            User.findById(requestedUserId)
                .then(user => {
                    let oldFavouriteList = user.favouriteUri
                    if (!(oldFavouriteList.includes(req.params.bookId)))
                        oldFavouriteList.push(req.params.bookId)

                    User.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(requestedUserId) }, { favouriteUri: oldFavouriteList })
                        .then((user) => {
                            res.sendStatus(200)
                        })
                })

        } catch (err) {
            res.sendStatus(400)
        }
    }
})

router.get('/info&id=:id&page=:page', (req, res) => {
    User.findById(req.params.id, async function (err, user) {
        if (err) throw (err);
        Book.find({ uploadedBy: user.email })
            .skip((req.params.page - 1) * 10)
            .limit(10)
            .exec(function (err, docs) {
                res.json(docs)
            })
    })
})

router.get('/info&page=:page', (req, res) => {
    if (!req.headers.authorization) res.sendStatus(400)
    try {
        tokenString = req.headers.authorization.split(' ')
        const verified = jwt.verify(tokenString[1], process.env.TOKEN_SECRET)
        requestedUserId = verified._id;
        User.findById(requestedUserId)
            .then(user => {
                Book.find({ uploadedBy: user.email })
                    .skip((req.params.page - 1) * 10)
                    .limit(10)
                    .exec(function (err, docs) {
                        res.json(docs)
                    })
            })
            .catch(err => console.log(err))

    } catch (err) {
        res.sendStatus(400)
    }

})

module.exports = router