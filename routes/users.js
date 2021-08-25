const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
const { ensureAuthenticated } = require('../config/auth')
const Seller = require('../models/Seller')
const User = require('../models/User')
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
    req.flash('success_msg', 'You are logged out')
    res.redirect('/users/login');
})

router.get('/register', (req, res) => {
    res.render('index/register')
})

router.post('/changeAvatar',upload.single("image"), async (req, res)=>{

    try {
        let user = await User.findById(req.user._id);
        // Delete image from cloudinary
        if(user.cloudinaryId){
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

        res.redirect('/')
      } catch (err) {
        console.log(err);
      }
})

router.post('/register', (req, res) => {
    const { first_name, last_name, email, password, password2, gender, states, location } = req.body
    let errors = []

    if (!first_name || !last_name || !email || !gender|| states == '' || location == '' || !password || !password2)
        errors.push({ msg: 'Please enter all fields' })

    if (password !== password2)
        errors.push({ msg: 'Password do not match' })

    if (password.length < 8) {
        errors.push({ msg: 'Password should be at least 8 characters' })
    }

    // if ((noIC.length != 12 && noIC != "")) {
    //     errors.push({ msg: 'IC format incorrect' })
    // }

    if (errors.length > 0) {
        res.render('index/register', {
            errors, first_name, last_name, email, password, password2, gender, states, location
        })
    } else {
        User.findOne({
            email: email
        })
            .then((user) => {
                if (!user) {

                    const newUser = new User({
                        firstName: first_name, lastName: last_name, email, password, gender, states, location
                    })
                    bcrypt.genSalt(10, function (err, salt) {
                        if (err) throw err

                        bcrypt.hash(newUser.password, salt, function (err, hash) {
                            if (err) throw err

                            newUser.password = hash
                            newUser.save()
                                .then((users) => {
                                    req.flash('success_msg', 'You are now registered!')

                                    res.redirect('/users/login')
                                })
                                .catch(err => console.log(err))
                        });
                    });
                    const newSeller = new Seller({
                        email: email
                    })
                    newSeller.save()
                        .then()
                        .catch(err => console.log(err))
                } else {
                    errors.push({ msg: 'User existed. Please Login' })
                    res.render('index/register', {
                        errors, first_name, last_name, email, password, password2, gender, states, location
                    })
                }
            })
            .catch(err => console.log(err))
    }
})

router.post('/setting', (req, res) => {
    let errors = []
    const {
        first_name,
        last_name,
        noIC,
        email,
        password,
        password2,
        gender,
        noTel,
        states,
        location,
        whatsappLink,
        messengerLink,
        wechatLink,
        instagramLink } = req.body

    if (!first_name || !last_name || !email || !gender || !noTel || states == '' || location == '')
        errors.push({ msg: 'Please enter all required fields' })
    if (errors.length > 0) {
        res.render('index/setting', {
            errors, user: req.user
        })
        // if ((password !== password2) && password2 != '')
        //     errors.push({ msg: 'Password do not match' })
    }
    if (req.user.email != email) {
        User.findOne({ email: email }, function (err, user) {
            if (err) throw err
            if (user) {
                errors.push({ msg: 'User existed. Please try again' })
                res.render('index/setting', {
                    errors, user: req.user
                })
            }
            else {
                User.findOneAndUpdate({ email: req.user.email }, {
                    firstName: first_name,
                    lastName: last_name,
                    email: email,
                    gender: gender,
                    noTel: noTel,
                    states: states,
                    location: location,
                    whatsappLink: whatsappLink,
                    messengerLink: messengerLink,
                    wechatLink: wechatLink,
                    instagramLink: instagramLink
                    // ,
                    // avatarUri:{
                    //     type:String
                    // }

                }, (err, doc) => {
                    if (err) throw err
                    else {
                        req.user.email = email
                        console.log(req.user.email)
                        res.redirect('/sellers/setting')
                    }
                })

            }
        })
    } else if (req.user.email == email) {
        User.findOneAndUpdate({ email: req.user.email }, {
            firstName: first_name,
            lastName: last_name,
            gender: gender,
            noTel: noTel,
            states: states,
            location: location,
            whatsappLink: whatsappLink,
            messengerLink: messengerLink,
            wechatLink: wechatLink,
            instagramLink: instagramLink
            // ,
            // avatarUri:{
            //     type:String
            // }
        }, (err, doc) => {
            if (err) throw err
            else {
                res.redirect('/sellers/setting')
            }
        })


    }

    //console.log(req.body)
})

router.post('/changePassword', (req, res) => {
    //check 3 new fields entered?
    const oldPassword = req.body.oldPassword
    const newPassword1 = req.body.newPassword1
    const newPassword2 = req.body.newPassword2
    let errors = []

    if (!oldPassword || !newPassword1 || !newPassword2)
        errors.push({ msg: 'Please enter all required fields' })
    //check new passwords same?
    if (newPassword1 != newPassword2)
        errors.push({ msg: 'Passwords do not match' })

    if (errors.length > 0) {
        res.render('index/setting', {
            errors, user: req.user
        })
    } else {
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
                                res.redirect('/sellers/setting')
                            }
                        })
                    });
                });
            } else {
                errors.push({ msg: 'Password incorrect. Please try again.' })
                res.render('index/setting', {
                    errors, user: req.user
                })
            }

            // update in db
            // else return error msg + redirect
        });
    }


})

router.post('/login', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})

module.exports = router