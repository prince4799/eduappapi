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
const adminrouter = express.Router();
const Admin = mongoose.model('Admin')
// const User = mongoose.model('User');
// const CategoryModel = mongoose.model('Category')
// const Content = mongoose.model('Contents')

// User handling for admin
const TAG='Admin Route js'

adminrouter.post('/create', async (req, res) => {
    const { email, password, username, contact } = req.body;
    const expectedKeys = ['email', 'password', 'username', 'contact'];
    const reqKeys = Object.keys(req.body);

    if (!reqKeys.every(key => expectedKeys.includes(key))) {
        return res.status(422).send(error("Invalid fields."));
    }

    if (expectedKeys.length != reqKeys.length || !validlength(email) || !validlength(password) || !validlength(username) || !validlength(contact)) {
        return res.status(422).send(error("Invalid fields"));
    }

    try {
        const admin = new Admin({ email, password, username, contact })
        const tokenKey = jwt.sign({ userID: admin._id }, jwtKey)
        admin.token = tokenKey
        await admin.save();
        res.status(201).send(success("Admin Created Successfully", tokenKey))
    } catch (err) {
        if (err.keyValue) {
            res.status(409).send(error(Object.keys(err.keyValue) + " is invalid or already used"))
        } else {
            res.status(500).send(error(err))
        }
        console.log(TAG, err.message, err);
    }
})

adminrouter.post('/login', jwtAuth, async (req, res) => {
    const { userid, password } = req.body;
    const expectedKeys = ['userid', 'password'];
    const reqKeys = Object.keys(req.body);
    
    if (
      !expectedKeys.every(key => reqKeys.includes(key)) ||
      !userid ||
      !password ||
      !validlength(userid) ||
      !validlength(password)
    ) {
      return res.status(422).json(error("Invalid fields."));
    }
    
    try {
      const admin = await Admin.findOne({ $or: [{ username: userid }, { email: userid }] });
      console.log('admin:', admin);
      if (!admin) {
        return res.status(401).json(error("Admin is not registered"));
      }
      
      if (!admin.password) {
        return res.status(401).json(error("Password is missing."));
      }
      
      const passwordMatch = await admin.comparePassword(password, admin.password);
      
      if (!passwordMatch) {
        return res.status(403).json(error('Password or Email/Username/Contact not matched.'));
      }
      
      const token = admin.token;
      
      return res.status(200).json(success('Successfully logged in', token));
    } catch (err) {
      console.log(err);

      return res.status(403).json(error("Password or Email/Username/Contact not matched."));
    }
  });
  
adminrouter.put('/updateadmin', jwtAuth, async (req, res) => {
    const { username, password, email, contact } = req.body;
    const expectedKeys = ['username', 'password', 'contact', 'email'];
    const reqKeys = Object.keys(req.body);
    if (!reqKeys.every(key => expectedKeys.includes(key)) || expectedKeys.length != reqKeys.length || !validlength(username) || !validlength(contact) || !validlength(email) || !validlength(password)) {
        return res.status(401).send(error("Invalid fields."));
    }
    if (!username || !email || !contact || !password) {
        return res.status(401).send(error('Password or Email/Username/Contact is missing.'));
    }
    const { authorization } = req.headers;
    const admin = await Admin.findOne({ token: authorization });
    if (!admin) {
        return res.status(404).send(error("User not found."));
      }
    

    try {
        let query = {};
    if (username) {
      query.username = username;
      const invalidUpdate = await Admin.findOne(query).exec();
      if (invalidUpdate) {
        return res.status(409).send(error("Username is already taken."));
      }
      admin.username = username;
    }
    if (email) {
      query.email = email;
      const invalidUpdate = await Admin.findOne(query).exec();
      if (invalidUpdate) {
        return res.status(409).send(error("Email is already taken."));
      }
      admin.email = email;
    }
    if (contact) {
      query.contact = contact;
      const invalidUpdate = await Admin.findOne(query).exec();
      if (invalidUpdate) {
        return res.status(409).send(error("Contact is already taken."));
      }
      admin.contact = contact;
    }
    const updatedUser = await admin.save();
    res.status(200).send(success("Admin updated successfully."));
    } catch (err) {
        console.log("error in catch", err);
        return res.status(401).send(error('Internal server Error'))
    }
})

module.exports = adminrouter;