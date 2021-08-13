const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
const { ensureAuthenticated } = require('../config/checkAuth')

const User = require('../models/User')


router.get('/login', (req, res) => {
    if (req.user) {
        res.redirect('/store')
    } else {
        res.render('login')
    }
})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'You are logged out')
    res.redirect('/users/login');
})

router.get('/register', ensureAuthenticated, (req, res) => {
    res.render('register')
})

router.post('/register', (req, res) => {
    const { first_name, last_name, noIC, email, password, password2, gender, dob, states, location } = req.body
    let errors = []

    if (!first_name || !last_name || !noIC || !email || !gender || dob == '' || states == '' || location == '' || !password || !password2)
        errors.push({ msg: 'Please enter all fields' })

    if (password !== password2)
        errors.push({ msg: 'Password do not match' })

    if (password.length < 8) {
        errors.push({ msg: 'Password should be at least 8 characters' })
    }

    if ((noIC.length != 12 && noIC != "")) {
        errors.push({ msg: 'IC format incorrect' })
    }

    if (errors.length > 0) {
        res.render('seller_register', {
            errors, first_name, last_name, noIC, email, password, password2, gender, dob, states, location
        })
    } else {
        User.findOne({
            noIC: noIC,
            email: email
        })
            .then((user) => {
                if (!user) {
                    const date_of_birth = dob
                    const newUser = new User({
                        firstName: first_name, lastName: last_name, noIC, email, password, gender, dateOfBirth: date_of_birth, states, location
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
                } else {
                    errors.push({ msg: 'User existed. Please Login' })
                    res.render('seller_register', {
                        errors, first_name, last_name, noIC, email, password, password2, gender, dob, states, location
                    })
                }
            })
            .catch(err => console.log(err))
    }
})

router.post('/login', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/store',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})

module.exports = router