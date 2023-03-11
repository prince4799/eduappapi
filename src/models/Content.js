'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Content = new Schema({
    videolink: {
        type: String,
        unique: true,
        required: [true, "Please enter the link"],
    },
    thumbnail: {
        type: String,
        unique: false,
        required: true,

    },
    title: {
        type: String,
        unique: [true, "Please enter different title."],
        required: [true, "Please enter title."],
    },
    category: {
        type: String,
        unique: false,
        // required: [true, "Please enter title."],
    }


})
mongoose.set('strictQuery', true);
module.exports=mongoose.model('Contents', Content)