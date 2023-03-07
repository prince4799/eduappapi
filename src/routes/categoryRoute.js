'use strict';
const express = require('express')
var app = express();
app.use(express.json());
const categoryrouter = express.Router();
const { error, success, contentsuccess } = require('../utils/Constants')
const jwtAuth = require('../middleware/authkeys')
const mongoose = require('mongoose')
const Category = require('../models/Categories');
const CategoryModel = mongoose.model('Category')


categoryrouter.post("/add", async (req, res) => {

    const category = req.body.category

    if (!category) {
        return res.status(401).send(error("Invalid Field", lengthofbody))

    }

    var lengthofbody = category.replace(/\s/g, '').length
    console.log("lengthofbody", lengthofbody)

    if (!req.body || !lengthofbody) {
        return res.status(401).send(error("Category can't be empty.", lengthofbody))
    }

    try {

        const category = new CategoryModel({ category: req.body.category })

        await category.save();
        res.status(200).send(success("New category added successfully"))
    } catch (err) {
        if (err.keyValue) {
            res.status(400).send(error({ "message": Object.keys(err.keyValue) + " is invalid" }))
        }
        else {
            console.log("error in else catch", err);
            res.status(400).send({ error: error(err.message) })
        }
        console.log("error in catch", err.message, err);
    }



})


categoryrouter.get("/getlist", jwtAuth, async (req, res) => {
    try {
        const list = await CategoryModel.find({});
        if (list.length > 0) {
            return res.status(200).send(contentsuccess("List loaded successfully", { category: list }));
        }
        return res.status(401).send('List is empty.');
    } catch (err) {
        console.error("Error:", err);
        return res.status(401).send('Error loading list.');
    }
})


categoryrouter.post("/updatelist", jwtAuth, async (req, res) => {
    const { category, oldcategory } = req.body;
    if (!category || !oldcategory) {
        return res.status(400).send(error("Invalid fields"));
    }

    try {
        const updatedCategory = await CategoryModel.findOneAndUpdate(
            { category: oldcategory },
            { category }
        );

        if (updatedCategory) {
            return res.status(200).send(contentsuccess("List updated successfully", { category: category }));
        }

        return res.status(401).send(error("List is empty."));
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).send(error("Error updating list."));
    }
});


module.exports = categoryrouter
