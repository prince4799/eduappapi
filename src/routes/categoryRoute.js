'use strict';
const express = require('express')
var app = express();
app.use(express.json());
const categoryrouter = express.Router();
const { error, success, contentsuccess, validlength } = require('../utils/Constants')
const jwtAuth = require('../middleware/authkeys')
const mongoose = require('mongoose')
const Category = require('../models/Categories');
const Admin = mongoose.model('Admin')
const CategoryModel = mongoose.model('Category')
const User = mongoose.model('User');
const headerSecretKey = process.env.HEADER_SECRET_KEY;
const { jsonLimiter, validateRequestBodySize } = require('../middleware/jsonLimiter');
const requestlimiter = require("../middleware/requestLimiter");



categoryrouter.post("/add", requestlimiter, jwtAuth, jsonLimiter, validateRequestBodySize, async (req, res) => {


    const secretKey = req.headers["x-secret-key"];
    if (!secretKey || secretKey !== '#heyram@') { //if secret key then only it can be uploaded
        return res.status(401).send(error("Unauthorized."));
    }

    const { authorization } = req.headers;
    const admin = await Admin.findOne({ token: authorization });
    if (!admin) {
        return res.status(404).send(error("User not found."));
    }

    const expectedKeys = ["category"]
    const bodyKeys = Object.keys(req.body)
    if (bodyKeys.length !== expectedKeys.length || !bodyKeys.includes("category")) {
        return res.status(401).send(error("Invalid fields."))
    }
    const category = req.body.category

    if (!category || !validlength(category)) {
        return res.status(401).send(error("Invalid category."))

    }

    // var lengthofbody = category.replace(/\s/g, '').length
    // console.log("lengthofbody", lengthofbody)

    // if (!req.body || !lengthofbody) {
    //     return res.status(401).send(error("Category can't be empty.", lengthofbody))
    // }

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

categoryrouter.get("/getlist", requestlimiter, jwtAuth, jsonLimiter, validateRequestBodySize, async (req, res) => {

    const { authorization } = req.headers;
    const user = await User.findOne({ token: authorization });
    // if (!user) {
    //     return res.status(404).send(error("User not found."));
    // }

    try {
        const list = await CategoryModel.find({});
        if (list.length > 0) {
            return res.status(200).send(contentsuccess("List loaded successfully", { category: list }));
        }
        return res.status(204).send(contentsuccess('List is empty.',{ category: {} }));
    } catch (err) {
        console.error("Error:", err);
        return res.status(401).send('Error loading list.');
    }
})

categoryrouter.post("/updatelist", requestlimiter, jwtAuth, jsonLimiter, validateRequestBodySize, async (req, res) => {

    const secretKey = req.headers["x-secret-key"];
    if (!secretKey || secretKey !== headerSecretKey) { //if secret key then only it can be uploaded
        return res.status(401).send(error("Unauthorized."));
    }

    const { authorization } = req.headers;
    const admin = await Admin.findOne({ token: authorization });
    if (!admin) {
        return res.status(404).send(error("User not found."));
    }

    const { category, oldcategory } = req.body;
    if (!category || !oldcategory) {
        return res.status(400).send(error("Invalid fields"));
    }

    try {
        const updatedCategory = await CategoryModel.findOneAndUpdate(
            { category },
            { category: oldcategory }
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

categoryrouter.delete("/delete", requestlimiter, jwtAuth, jsonLimiter, validateRequestBodySize, async (req, res) => {

    const secretKey = req.headers["x-secret-key"];
    if (!secretKey || secretKey !== headerSecretKey) { //if secret key then only it can be uploaded
        console.error("Invalid secret key:", secretKey);
        return res.status(401).send(error("Unauthorized."));
    }

    const { authorization } = req.headers;
    const admin = await Admin.findOne({ token: authorization });
    if (!admin) {
        return res.status(404).send(error("Admin not found."));
    }

    const expectedKeys = ["category"]
    const bodyKeys = Object.keys(req.body)
    if (bodyKeys.length !== expectedKeys.length || !bodyKeys.includes("category")) {
        return res.status(401).send(error("Invalid fields."))
    }
    const category = req.body.category

    if (!category || !validlength(category)) {
        return res.status(404).send(error("Invalid category."))

    }

    try {
        const deletedCategory = await CategoryModel.deleteOne(req.body).exec();
        if (deletedCategory.deletedCount === 0) {
            return res.status(404).send(error("Category not found."));
        }
        res.status(200).send(success("Category deleted successfully."));
    } catch (err) {
        console.error(err);
        res.status(500).send(error("Internal server error."));
    }
});

module.exports = categoryrouter