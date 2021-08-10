const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')

const User = require('../models/User')

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'You are logged out')
    res.redirect('/users/login');
})

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register', (req, res) => {
    const {name, email, password, password2} = req.body
    let errors = []

    if(!name ||!email || !password || !password2)
        errors.push({msg: 'Please enter all fields'})

    if(password !== password2)
        errors.push({msg: 'Password do not match'})

    if(password.length < 8){
        errors.push({msg: 'Password should be at least 6 characters'})
    }

    if(errors.length > 0){
        res.render('register', {
            errors, 
            name,
            email,
            password,
            password2
        })
    }else{
        //validation passed
        User.findOne({
            email: email
        })
        .then((user) => {
            if(user){
                errors.push({msg: 'User existed. Please Login'})
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                })
            }else{
                const newUser = new User({
                    name: name, 
                    email, 
                    password
                }) // newUser is instance of User( User --> Model --> based on schema --> (format we fixed just now))

                //Hash password
                bcrypt.genSalt(10, (err, salt)=> {
                    bcrypt.hash(newUser.password, salt, (err, hash) =>{
                        if(err){
                            throw err
                        }
                        //set password to hash
                        newUser.password = hash

                        //save user
                        newUser.save() //promises
                        .then((user) => {
                            req.flash('success_msg', 'You are now registered!')
                            
                            res.redirect('/users/login')
                        })
                        .catch((err)=> console.log(err))
                    })
                })
            }
        })
        .catch((err) => console.log(err))
    }
})

router.post('/login', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)


    //const {email, password} = req.body

    //validate

    // User.findOne({
    //     email: email
    // })
    // .then((user)=>{
    //     if(user){
    //         console.log('User Existed')
    //     }else{
    //         console.log('User Not Existed')
    //     }
    //     res.send('hi')
    // })
    // .catch((err) => console.log(err))
})

module.exports = router