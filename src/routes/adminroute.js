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
const { jsonLimiter, validateRequestBodySize } = require('../middleware/jsonLimiter');
const requestlimiter = require("../middleware/requestLimiter");
const headerSecretKey = process.env.HEADER_SECRET_KEY;
const Admin = mongoose.model('Admin')
const User = mongoose.model('User');
// const CategoryModel = mongoose.model('Category')
// const Content = mongoose.model('Contents')

// User handling for admin
const TAG = 'Admin Route js'

adminrouter.post('/auth/create', requestlimiter, jsonLimiter, validateRequestBodySize, async (req, res) => {
    console.log("request", req.headers)
    const secretKey = req.headers["x-secret-key"];
    if (!secretKey || secretKey !== '#heyram@') { //if secret key then only it can be uploaded
        console.error("Invalid secret key:", secretKey);
        return res.status(401).send(error("Unauthorized."));
    }

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
        const screen = 'Admin'
        admin.token = tokenKey
        await admin.save();
        res.status(201).send(success("Admin Created Successfully", tokenKey, { screen: screen }))
    } catch (err) {
        if (err.keyValue) {
            res.status(409).send(error(Object.keys(err.keyValue) + " is invalid or already used"))
        } else {
            res.status(500).send(error(err))
        }
        console.log(TAG, err.message, err);
    }
})

adminrouter.post('/auth/login', requestlimiter, jsonLimiter, validateRequestBodySize, async (req, res) => {

    const secretKey = req.headers["x-secret-key"];
    if (!secretKey || secretKey !== '#heyram@') { //if secret key then only it can be uploaded
        console.error("Invalid secret key:", secretKey);
        return res.status(401).send(error("Unauthorized User."));
    }


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
        const screen = 'Admin'

        return res.status(200).json(success('Successfully logged in', token, { email: admin.email }, { username: admin.username }, { contact: admin.contact }, { userType: admin.userType }, { screen: screen }));
    } catch (err) {
        console.log(err);

        return res.status(403).json(error("Password or Email/Username/Contact not matched."));
    }
});

adminrouter.put('/auth/updateadmin', requestlimiter, jwtAuth, jsonLimiter, validateRequestBodySize, async (req, res) => {

    const secretKey = req.headers["x-secret-key"];
    if (!secretKey || secretKey !== headerSecretKey) { //if secret key then only it can be uploaded
        console.error("Invalid secret key:", secretKey);
        return res.status(401).send(error("Unauthorized."));
    }


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
adminrouter.get('/getalluser', requestlimiter, jwtAuth, jsonLimiter, validateRequestBodySize, async (req, res) => {

    const secretKey = req.headers["x-secret-key"];
    if (!secretKey || secretKey !== '#heyram@') { //if secret key then only it can be uploaded
        console.error("Invalid secret key:", secretKey);
        return res.status(401).send(error("Unauthorized."));
    }

    const { authorization } = req.headers;
    const admin = await Admin.findOne({ token: authorization });
    if (!admin) { return res.status(404).send(error("Admin not found.")); }
    try {
        const users = await User.find({})
        const admin = await Admin.find({})
        let allUsers = [];

        if (users.length === 0 && admin.length === 0) {
            allUsers = [];
        } else if (users.length === 0) {
            allUsers = admin;
        } else if (admin.length === 0) {
            allUsers = users;
        } else {
            allUsers = [...users, ...admin];
        }

        if (allUsers.length === 0) {
            return res.status(404).send(error("Users not found."));
        }
        return res.status(200).send({
            "message": "All users load successfully",
            "users": allUsers,
            "status": "true",
            "statuscode": 200,
            "timestamp": new Date().toLocaleString(),

        })
    } catch (err) {
        console.log("error in ", TAG, '\n', err);
        return res.status(500).send(error("Internal server error."));
    }
})

adminrouter.put('/updateuser', requestlimiter, jwtAuth, jsonLimiter, validateRequestBodySize, async (req, res) => {

    const secretKey = req.headers["x-secret-key"];
    if (!secretKey || secretKey !== '#heyram@') { //if secret key then only it can be uploaded
        console.error("Invalid secret key:", secretKey);
        return res.status(401).send(error("Unauthorized."));
    }


    const expectedKeys = ["username", "email", "contact"];
    const bodyKeys = Object.keys(req.body);
    if (!bodyKeys.every(key => expectedKeys.includes(key))) {
        return res.status(401).send(error("Invalid fields."));
    }

    const { username, email, contact } = req.body;
    const { authorization } = req.headers;
    const admin = await Admin.findOne({ authorization: authorization })

    if (!admin) {
        return res.status(401).send(error("You are unauthorized."))
    }

    const user = await User.findOne({ $or: [{ username: username }, { email: email }, { contact: contact }] });
    if (!user) {
        return res.status(404).send(error("User not found."));
    }

    try {
        let query = {};
        if (username) {
            query.username = username;
            const invalidUpdate = await User.findOne(query).exec();
            if (invalidUpdate) {
                return res.status(409).send(error("Username is already taken."));
            }
            user.username = username;
        }
        if (email) {
            query.email = email;
            const invalidUpdate = await User.findOne(query).exec();
            if (invalidUpdate) {
                return res.status(409).send(error("Email is already taken."));
            }
            user.email = email;
        }
        if (contact) {
            query.contact = contact;
            const invalidUpdate = await User.findOne(query).exec();
            if (invalidUpdate) {
                return res.status(409).send(error("Contact is already taken."));
            }
            user.contact = contact;
        }

        await user.save();
        res.status(200).send(success("User updated successfully."));
    } catch (err) {
        console.error(err);
        return res.status(500).send(error("Internal server error." + err.message));
    }
})

adminrouter.delete("/deleteuser", requestlimiter, jwtAuth, jsonLimiter, validateRequestBodySize, async (req, res) => {

    const secretKey = req.headers["x-secret-key"];
    if (!secretKey || secretKey !== headerSecretKey) { //if secret key then only it can be uploaded
        console.error("Invalid secret key:", secretKey);
        return res.status(401).send(error("Unauthorized."));
    }


    const admin = await Admin.findOne({ authorization: req.headers.authorization })
    if (!admin) {
        return res.status(401).send(error("You are unauthorized."))
    }

    const expectedKeys = ["username", "email", "contact"];
    const bodyKeys = Object.keys(req.body);
    if (bodyKeys.length <= expectedKeys.length && !bodyKeys.includes("username") && !bodyKeys.includes("contact") && !bodyKeys.includes("email")) {
        return res.status(401).send(error("Invalid fields."));
    }

    const { username, email, contact } = req.body;
    // const validToken = await User.findOne({ token: authorization }).lean();
    // console.log("validToken", validToken, '\n', "authorization", authorization);

    // if (!validToken || validToken.token !== authorization) {
    //     return res.status(401).send(error("Invalid User."));
    // }

    const user = await User.findOne({ $or: [{ username: username }, { email: email }, { contact: contact }] });
    if (!user) {
        return res.status(404).send(error("User not found."));
    }

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



module.exports = adminrouter;