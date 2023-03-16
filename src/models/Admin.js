'use strict';
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const {isEmail}= require('validator')
const AdminSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: [true, "Please Enter Email"],
        validate:[isEmail,"Please Enter valid Email."]
    },
    password: {
        type: String,
        unique: false,
        required: true,
    },
    username: {
        type: String,
        unique: true,
        required: [true, "Please Enter username."],
    },
    contact: {
        type: Number,
        unique: true,
        required: [true, "Please Enter contact no."],
        // validate:[{validator: isMobilePhone, msg: "Please Enter valid mobile no."}, "Please Enter valid mobile no."]
    },
    token:{
        type :String,
        unique:true,
        required:false,
        default:null,
    }})
mongoose.set('strictQuery', true);
AdminSchema.pre('save', function (next) {
    var admin = this;

    // only hash the password if it has been modified (or is new)
    if (!admin.isModified('password')) {
        return next();
    }

    // generate a salt
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            return next(err);
        }
        // hash the password using our new salt
        bcrypt.hash(admin.password, salt, function (err, hash) {
            if (err) {
                return next(err);
            }
            // override the cleartext password with the hashed one
            admin.password = hash;
            next();
        }) }) })

AdminSchema.methods.comparePassword = function (candidatePassword) {
    const admin = this;
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, admin.password, (err, isMatch) => {
            if (err || !isMatch)
                return reject(err);
            resolve(isMatch);
        });
    })
};


mongoose.model('Admin', AdminSchema)