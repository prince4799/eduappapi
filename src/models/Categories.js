'use strict';
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const CategorySchema = new mongoose.Schema({

    category: {
        type: String,
        unique: true,
        required: [true, "Please Enter Category"],
    },


})
mongoose.set('strictQuery', true);
mongoose.model('Category', CategorySchema)
