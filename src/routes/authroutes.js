'use strict';
const express = require('express')
var app = express();
app.use(express.json());
const { error, success, validlength } = require('../utils/Constants')
const passport = require('passport')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { jwtKey } = require('../confidential/jwtKey')
const jwtAuth = require('../middleware/authkeys')
const router = express.Router();
const User = mongoose.model('User');

const passportSetup = require('../models/GoogleAuth')

const TAG = '/signuproute'

router.post("/signup", async (req, res) => {
  const bodyKeys = Object.keys(req.body)
  const expectedKeys = ["username", "password", "email", "contact"]
  const { email, password, username, contact } = req.body;
  if (bodyKeys.length != expectedKeys.length || !validlength(username) || !validlength(password) || !validlength(email) || !validlength(contact)) {
    return res.status(401).send(error("Invalid Fields"))
  }
  // console.log("signup", req.body)

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

router.post("/signin", async (req, res) => {
  const bodyKeys = Object.keys(req.body)
  const expectedKeys = ["userid", "password"]
  if (bodyKeys.length != expectedKeys.length || !validlength(req.body.userid) || !validlength(req.body.password)) {
    return res.status(401).send(error("Invalid Fields"))
  }
  const { userid, password } = req.body
  // console.log("request body", req.body);

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
    res.status(200).send(success('Successfully logged in', token, screenName))
  } catch (err) {
    console.log(err);
    return res.status(401).send(error("Password or Email/ Username not matched. "))
  }
})

router.delete("/deleteuser", jwtAuth, async (req, res) => {
  const expectedKeys = ["username", "email", "contact"];
  const bodyKeys = Object.keys(req.body);
  if (bodyKeys.length <= expectedKeys.length && !bodyKeys.includes("username")&& !bodyKeys.includes("contact") && !bodyKeys.includes("email")) {
    return res.status(401).send(error("Invalid fields."));
  }

  const { username, email, contact } = req.body;

  try {
    let query = {};
    if (username) {
      query.username = username;
    }
    if (email) {
      query.email = email;
    }
    if (contact) {
      query.contact = contact;
    }
    
    const deletedUser = await User.findOneAndDelete(query).exec();
    if (!deletedUser) {
      return res.status(404).send(error("User not found."));
    }
    res.status(200).send(success("User deleted successfully."));
  } catch (err) {
    console.error(err);
    return res.status(500).send(error("Internal server error."));
  }
});

router.put('/updateuser',jwtAuth,async (res,req)=>{
  
})

router.post('/logout', (req, res) => {
  // Clear the token from the client-side cookie
  res.clearCookie('token');
  res.status(200).send(success('Successfully logged out'));
});
//=======================use logout api in react native===============================
/*
fetch('https://your-server.com/logout', {
  method: 'POST',
  credentials: 'include', // use include to send the cookie
})
  .then(response => {
    if (response.ok) {
      // Handle success
      console.log('Successfully logged out');
    } else {
      // Handle error
      console.error('Error logging out');
    }
  })
  .catch(error => {
    // Handle network error
    console.error(error);
  });

*/
router.post("/google", passport.authenticate('google', {
  scope: ['profile']
}))


module.exports = router;