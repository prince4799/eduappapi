'use strict';
const express = require('express')
var app = express();
app.use(express.json());
const { error, success } = require('../utils/Constants')
const passport = require('passport')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { jwtKey } = require('../confidential/jwtKey')
const router = express.Router();
const User = mongoose.model('User');

const passportSetup = require('../models/GoogleAuth')

const TAG = '/signuproute'

router.post("/signup", async (req, res) => {

  const { email, password, username, contact } = req.body;
  console.log("signup", req.body)

  try {
    const user = new User({ email, password, username, contact })
    await user.save();
    const tokenKey = jwt.sign({ userID: user._id }, jwtKey)
    res.status(200).send(success("User saved successfully", tokenKey))
  } catch (err) {
    if (err.keyValue) {
      res.status(401).send(error(Object.keys(err.keyValue) + " is invalid or already used"))
    }
    else {
      res.status(401).send(error(err.message))
    }
    console.log(TAG, err.message, err);
  }
})


/*router.post("/signin", async (req, res) => {
  const { userid, password } = req.body
  console.log("request body", req.body);
  var value = {}


  if (!userid || !password) {
    return res.status(401).send(error('Password or Email/Username is missing.'));
  } else {
    var user = await Promise.all([User.find({})
      .clone()
      .catch((err) => { console.log("error in finding user", err) })])
    user.map((item, index) => {
      if (item.username == req.body.userid || item.email == req.body.userid) {
        value = item;
        return res.status(401).send(error("User is not registered"))
      }
      // console.log("->->->->->->", value,user);
    })
    if (!value) {
      console.log("User is not registered");
      return res.status(401).send(error("User is not registered"))
    }
    if (value.userid == '' || value.password == '' || value == {} || value == null) {
      return res.status(401).send(error("Password or Email/Username is missing."))
    }
    else {
      try {
        value={
          email: 'qwertyui@mail.com',
          password: '$2b$10$9nV6w.hstky0/xCfdTl7Qe1/.YzT7P/sEw5RFPQ9Ekz0vEwy/rki2',
          username: 'PriVer',
          contact: 1234567,
          userType: 'Public',
          paid: 'demo',
        }
        await value.comparePassword(password)
        const token = jwt.sign({ userID: value._id }, jwtKey)
        let screenName = ''
        if (value.userType == 'Admin') {
          screenName = 'Admin'
        }
        else {
          screenName = 'Public'
        }
        res.status(200).send({ tokenID: token, success: success('Successfully loged in'), screen: screenName })
      } catch (err) {
        console.log(err);
        return res.status(401).send(error('catch Password or Email/ Username not matched.'))
      }
    }

  }



})*/

router.post("/signin", async (req, res) => {
  const { userid, password } = req.body
  console.log("request body", req.body);

  if (!userid || !password) {
    return res.status(401).send(error('Password or Email/Username is missing.'));
  }

  try {
    const user = await User.findOne({ $or: [{ username: userid }, { email: userid }] })
    if (!user) {
      console.log("User is not registered");
      return res.status(401).send(error("User is not registered"))
    }

    if (!user.password) {
      return res.status(401).send(error("Password is missing."))
    }

    const passwordMatch = await user.comparePassword(password, user.password)
    if (!passwordMatch) {
      return res.status(401).send(error('Password or Email/ Username not matched.'))
    }

    const token = jwt.sign({ userID: user._id }, jwtKey)
    let screenName = ''
    if (user.userType == 'Admin') {
      screenName = 'Admin'
    }
    else {
      screenName = 'Public'
    }
    res.status(200).send( success('Successfully logged in',token,screenName))
  } catch (err) {
    console.log(err);
    return res.status(401).send(error("Password or Email/ Username not matched. "))
  }
})


router.post("/google", passport.authenticate('google', {
  scope: ['profile']
}))


module.exports = router;