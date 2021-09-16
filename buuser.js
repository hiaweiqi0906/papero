// const express = require('express')
// const router = express.Router()
// const bcrypt = require('bcryptjs')
// const passport = require('passport')
// const User = require('../models/User')
// const upload = require('../utils/multer')
// const cloudinary = require("../utils/cloudinary");

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
const db = require('../config/keys').MongoURI;
const Seller = require('../models/Seller')
const User = require('../models/User')
const Book = require('../models/Book')
const dotenv = require('dotenv')
const upload = require('../utils/multer')
const cloudinary = require("../utils/cloudinary");
router.get('/login', (req, res) => {
    if (req.user) {
        res.redirect('/')
    } else {
        res.render('index/login')
    }
})

router.put("/:id", upload.single("image"), async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        // Delete image from cloudinary
        await cloudinary.uploader.destroy(user.cloudinary_id);
        // Upload image to cloudinary
        let result;
        if (req.file) {
            result = await cloudinary.uploader.upload(req.file.path);
        }
        const data = {
            name: req.body.name || user.name,
            avatar: result?.secure_url || user.avatar,
            cloudinary_id: result?.public_id || user.cloudinary_id,
        };
        user = await User.findByIdAndUpdate(req.params.id, data, { new: true });
        res.json(user);
    } catch (err) {
        console.log(err);
    }
});

router.get('/logout', (req, res) => {
    req.logout()
    res.json({ msg: 'logged out' })
})

router.get('/register', (req, res) => {
    res.render('index/register')
})

router.get('/checkIsLoggedIn', (req, res) => {
    console.log(req)
    if (req.user) {
        res.json({ statusCode: '200', user: req.user })
    } else {
        res.send({ statusCode: '401' })
    }
})

router.post('/changeAvatar', upload.single("image"), async (req, res) => {

    try {
        let user = await User.findById(req.user._id);
        // Delete image from cloudinary
        if (user.cloudinaryId) {
            await cloudinary.uploader.destroy(user.cloudinaryId);
        }

        // Upload image to cloudinary
        let result;
        if (req.file) {
            result = await cloudinary.uploader.upload(req.file.path);
        }
        const data = {
            avatarUri: result?.secure_url || user.avatarUri,
            cloudinaryId: result?.public_id || user.cloudinaryId,
        };
        user = await User.findByIdAndUpdate(req.user._id, data, { new: true });
    } catch (err) {
        console.log(err);
    }
})

router.get('/retrieveInfo', (req, res) => {
    const user = (req.user).toObject()
    delete user['password']
    res.json(user)
})

router.get('/retrieveOthersInfo/:email', (req, res) => {
    res.json(req.user)
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
                                res.sendStatus(200)
                            })
                            .catch(err => console.log(err))
                    });
                });
            } else {
                res.json({ msg: "User registered!" })
            }
        })
        .catch(err => console.log(err))
    // const { first_name, last_name, email, password, password2, gender, states, location } = req.body
    // let errors = []

    // if (!first_name || !last_name || !email || !gender|| states == '' || location == '' || !password || !password2)
    //     errors.push({ msg: 'Please enter all fields' })

    // if (password !== password2)
    //     errors.push({ msg: 'Password do not match' })

    // if (password.length < 8) {
    //     errors.push({ msg: 'Password should be at least 8 characters' })
    // }

    // // if ((noIC.length != 12 && noIC != "")) {
    // //     errors.push({ msg: 'IC format incorrect' })
    // // }

    // if (errors.length > 0) {
    //     res.render('index/register', {
    //         errors, first_name, last_name, email, password, password2, gender, states, location
    //     })
    // } else {
    //     User.findOne({
    //         email: email
    //     })
    //         .then((user) => {
    //             if (!user) {

    //                 const newUser = new User({
    //                     firstName: first_name, lastName: last_name, email, password, gender, states, location
    //                 })
    //                 bcrypt.genSalt(10, function (err, salt) {
    //                     if (err) throw err

    //                     bcrypt.hash(newUser.password, salt, function (err, hash) {
    //                         if (err) throw err

    //                         newUser.password = hash
    //                         newUser.save()
    //                             .then((users) => {
    //                                 req.flash('success_msg', 'You are now registered!')

    //                                 res.redirect('/users/login')
    //                             })
    //                             .catch(err => console.log(err))
    //                     });
    //                 });
    //                 const newSeller = new Seller({
    //                     email: email
    //                 })
    //                 newSeller.save()
    //                     .then()
    //                     .catch(err => console.log(err))
    //             } else {
    //                 errors.push({ msg: 'User existed. Please Login' })
    //                 res.render('index/register', {
    //                     errors, first_name, last_name, email, password, password2, gender, states, location
    //                 })
    //             }
    //         })
    //         .catch(err => console.log(err))
    // }
})

router.post('/setting', (req, res) => {
})

router.post('/getsetting', (req, res) => {
    res.send(req.body)
})

router.post('/changePassword', (req, res) => {
    //check 3 new fields entered?
    const oldPassword = req.body.oldPassword
    const newPassword1 = req.body.newPassword1


    //get old password from db
    // let user = await User.findById(req.user._id);
    //compare old password
    bcrypt.compare(oldPassword, req.user.password, function (err, result) {
        // if result==true
        if (result) {
            bcrypt.genSalt(10, function (err, salt) {
                if (err) throw err

                bcrypt.hash(newPassword1, salt, function (err, hash) {
                    if (err) throw err

                    User.findOneAndUpdate({ email: req.user.email }, {
                        password: hash
                    }, (err, doc) => {
                        if (err) throw err
                        else {
                            req.user.password = hash
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

router.get('/favourites&page=:page', (req, res) => {
    if (!req.user) {

    } else {
        Book.find({ _id: { $in: req.user.favouriteUri } })
            .skip((req.params.page - 1) * 10)
            .limit(10)
            .exec(function (err, docs) {
                res.json(docs)
            })
    }
})


router.get('/info&email=:email&page=:page', (req, res) => {
    User.findOne({ email: (req.params.email.substring(1)) }, async function (err, user) {
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
    if (!req.user) {

    } else {
        Book.find({ uploadedBy: req.user.email })
            .skip((req.params.page - 1) * 10)
            .limit(10)
            .exec(function (err, docs) {
                res.json(docs)
            })
    }
})

router.post('/removeFavourites&id=:bookId', (req, res) => {
    if (req.user) {
        let oldFavouriteList = req.user.favouriteUri
        let result = oldFavouriteList.filter(item => item != req.params.bookId)
        User.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(req.user._id) }, { favouriteUri: result })
            .then(() => {
                req.user.favouriteUri = result
                res.send({ msg: 'favourite list updated!' })
            })
            .catch(err => console.log(err))
    } else {
        res.send({ msg: 'user not logged in' })
    }
})

router.post('/addFavourites&id=:bookId', (req, res) => {
    if (req.user) {
        let oldFavouriteList = req.user.favouriteUri

        if (!(oldFavouriteList.includes(req.params.bookId))) {
            oldFavouriteList.push(req.params.bookId)
        }
        User.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(req.user._id) }, { favouriteUri: oldFavouriteList })
            .then(() => {
                req.user.favouriteUri = oldFavouriteList
                res.send({ msg: 'favourite list updated!' })
            })
            .catch(err => console.log(err))
    } else {
        res.send({ msg: 'user not logged in' })
    }
})

router.post('/login', (req, res, next) => {
    const user = new User({
        email: req.body.email,
        password: req.body.password
    })
    req.login(user, (err) => {
        if (err) console.log(err)
        else {
            passport.authenticate('local')(req, res, () => {
                res.sendStatus(200)
            })
        }
    })
    // passport.authenticate('local')(req, res, () => {
    //     // res.cookie('keyboard cat.', { secure: true, signed: true, expires: new Date(Date.now() + 3600) });
    //     res.sendStatus(200)
    // })
})

module.exports = router