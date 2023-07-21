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
const Contents = require('../models/Content');



/*
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
    const category = req.body.category.toLowerCase()

    if (!category || !validlength(category)) {
        return res.status(401).send(error("Invalid category."))

    }
    try {
        // const category = req.body.category.toLowerCase(); // Convert the category to lowercase

        const category = new CategoryModel({ category: req.body.category })
        const newCategory = await CategoryModel.findOne({ $or: [{  category: req.body.category }] })
        if (newCategory) {
          console.log("Categor is already present");
          return res.status(200).send(success("Category is already present"))
        }
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
*/

categoryrouter.post("/add", requestlimiter, jwtAuth, jsonLimiter, validateRequestBodySize, async (req, res) => {
    const secretKey = req.headers["x-secret-key"];
    if (!secretKey || secretKey !== '#heyram@') {
        return res.status(401).send(error("Unauthorized."));
    }

    const { authorization } = req.headers;
    const admin = await Admin.findOne({ token: authorization });
    if (!admin) {
        return res.status(404).send(error("User not found."));
    }

    const expectedKeys = ["category"];
    const bodyKeys = Object.keys(req.body);
    if (bodyKeys.length !== expectedKeys.length || !bodyKeys.includes("category")) {
        return res.status(401).send(error("Invalid fields."));
    }

    const category = req.body.category.trimEnd();

    if (!category || !validlength(category)) {
        return res.status(401).send(error("Invalid category."));
    }

    try {
        const existingCategory = await CategoryModel.findOne({
            category: { $regex: new RegExp(`^${category}$`, "i") }, // Use case-insensitive regex query
        });
        if (existingCategory) {
            console.log("Category is already present");
            return res.status(200).send(success("Category is already present"));
        }

        const categoryObj = new CategoryModel({ category });
        await categoryObj.save();
        res.status(200).send(success("New category added successfully"));
    } catch (err) {
        if (err.keyValue) {
            res.status(400).send(error({ "message": Object.keys(err.keyValue) + " is invalid" }));
        } else {
            console.log("Error in else catch", err);
            res.status(400).send({ error: error(err.message) });
        }
        console.log("Error in catch", err.message, err);
    }
});

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
        return res.status(200).send(contentsuccess('List is empty.', { category: {} }));
    } catch (err) {
        console.error("Error:", err);
        return res.status(401).send('Error loading list.');
    }
})
/*
categoryrouter.post("/updatelist", requestlimiter, jwtAuth, jsonLimiter, validateRequestBodySize, async (req, res) => {

    const secretKey = req.headers["x-secret-key"];
    if (!secretKey || secretKey !== headerSecretKey) {
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
*/

categoryrouter.post("/updatelist", requestlimiter, jwtAuth, jsonLimiter, validateRequestBodySize, async (req, res) => {
    const secretKey = req.headers["x-secret-key"];
    if (!secretKey || secretKey !== '#heyram@') {
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
      // Update CategoryModel
      const updatedCategory = await CategoryModel.findOneAndUpdate(
        { category: { $regex: new RegExp(`^${oldcategory}$`, "i") } },
        { category: category.trimEnd() }
      );
  
      if (!updatedCategory) {
        return res.status(404).send(error("Category not found."));
      }
  
      // Update Contents model
      await Contents.updateMany(
        { category: { $regex: new RegExp(`^${oldcategory}$`, "i") } },
        { $set: { category: category } }
      );
  
      return res.status(200).send(contentsuccess("List updated successfully", { category: category }));
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).send(error("Error updating list."));
    }
  });

categoryrouter.delete("/delete", requestlimiter, jwtAuth, jsonLimiter, validateRequestBodySize, async (req, res) => {

    const secretKey = req.headers["x-secret-key"];
    if (!secretKey || secretKey !== '#heyram@') { //if secret key then only it can be uploaded
        console.error("Invalid secret key:", secretKey, req.headers["x-secret-key"]);
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
        const deletedCategory = await CategoryModel.deleteOne({
            category:{ $regex: new RegExp(`^${category}$`, 'i') }
        }).exec();
        console.log("deletedCategory:",deletedCategory,{
            category:category+''
        });
      
        if (deletedCategory.deletedCount === 0) {
          return res.status(404).send(error("Category not found."));
        }

        if (deletedCategory.deletedCount === 1) 
        res.status(200).send(success("Category deleted successfully."));
      } catch (err) {
        console.error(err);
        res.status(500).send(error("Internal server error."));
      }
      
});

module.exports = categoryrouter