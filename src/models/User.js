'use strict';
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const {isEmail}= require('validator')
// const {isEmail,isMobilePhone}=require('validator')

const UserSchema = new mongoose.Schema({
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
        // minlength: [8, "Password must be minimum 8 characters long."],

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
        // validate:[isMobilePhone('en-IN', ),"Pleease Enter valid mobile no."]

    },
    userType: {
        type: String,
        unique: false,
        required: false,
        default:'Public'
        // validate:[isMobilePhone('en-IN', ),"Pleease Enter valid mobile no."]
    },
    paid: {
        type: String,
        unique: false,
        required: false,
        default:'demo'  //live for paid only
        // validate:[isMobilePhone('en-IN', ),"Pleease Enter valid mobile no."]
    },

})
mongoose.set('strictQuery', true);




UserSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        return next();

    }

    // generate a salt
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            return next(err);
        }
        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) {
                return next(err);
            }
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        }) }) })


        // const user = await User.findOne({ _id: req.user.userId });
        // if (!user) {
        //   throw new CustomError.UserNotFound();
        // }
        // const isPasswordValid = await user.comparePassword(oldPassword);
        



UserSchema.methods.comparePassword = function (candidatePassword) {
    const user = this;
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
            if (err || !isMatch)
                return reject(err);
            resolve(isMatch);
        });
    })
};


mongoose.model('User', UserSchema)