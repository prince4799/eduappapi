'use strict';
const express = require('express')
var app = express();
app.use(express.json());
const { error, success, contentsuccess, validlength } = require('../utils/Constants')
const mongoose = require('mongoose')
const contentrouter = express.Router();
const Contents = require('../models/Content');
const { uploadMiddleware, handleUpload } = require('../middleware/multer.js');
const jwtAuth = require('../middleware/authkeys')
const createPermanentLink = require('../scrapper/scripterfornode')
const fs = require('fs');
const headerSecretKey = process.env.HEADER_SECRET_KEY;
mongoose.model('Contents')

contentrouter.post("/upload",jwtAuth,uploadMiddleware, handleUpload , async (req, res) => {

  const expectedKeys = ["title", "videolink","category"];
  const bodyKeys = Object.keys(req.body);

  //crated my secret key to check if valid user can access my data base
  const secretKey = req.headers["x-secret-key"];
  if (!secretKey || secretKey !== '#heyram@') { //if secret key then only it can be uploaded
    return res.status(401).send(error("Unauthorized."));
  }

  if (bodyKeys.length !== expectedKeys.length || !bodyKeys.includes("title") || !bodyKeys.includes("videolink") || !bodyKeys.includes("category") ) {
    return res.status(400).send(error("Invalid fields."))
  }
  const { videolink, title, category } = req.body;
  // const thumbnailBuffer = req.file.buffer; 
  const thumbnailPath = req.thumbnailPath; // Get the path of the saved file
  const thumbnailBuffer = fs.readFileSync(thumbnailPath); // Read the file data from the saved file

  var lengthofbody=Object.keys(bodyKeys).length
  if (!req.body || lengthofbody < 3 || !videolink || !title || !category) {
    return res.status(400).send(error("unable to generate link as fields are empty"))
  }
  console.log("videolink, title, category ",videolink, title, category, req.file );
  try {
    // const shortlink = await createPermanentLink(videolink)
    const shortlink = videolink;
    
    if (!shortlink) {
      return res.status(400).send(error("unable to generate link may be link is invalid"))
    }
    const permanentLink = 'https://gdurl.com' + shortlink;
    const videos = new Contents({ videolink: shortlink, thumbnail:thumbnailBuffer, title, category })
    
    await videos.save();
    res.status(200).send(contentsuccess("Video saved successfully", { videolink: shortlink, thumbnailPath, title ,category }))
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

contentrouter.get("/load", jwtAuth, async (req, res) => {
  console.log("trying in load");

  try {
    console.log("trying in try");
    var contents = await Contents.find({})
      .clone()
      .catch((err) => { console.log("error in finding user", err) });
    if (contents)
      res.status(200).send(contentsuccess("Video loaded successfully", { contents }))
    else {
      console.log("error in try", err);
      res.status(400).send({ error: error(err.message) })
    }
  } catch (err) {
    console.log("trying in try");
    console.log("error in catch", err.message, err);
  }
})

contentrouter.get("/load/search/:name", jwtAuth, async (req, res) => {
  const expectedKeys = ["title"];
  const bodyKeys = Object.keys(req.body);

  if (bodyKeys.length !== expectedKeys.length || !bodyKeys.includes("title")) {
    return res.status(401).send(error("Invalid fields."))
  }

  const lengthofbody = req.body.title.replace(/\s/g, '').length
  if (!lengthofbody) {
    return res.status(401).send(error("Fields can't be empty."))
  }

  try {
    const contents = await Contents.find({ title: { $regex: req.body.title, $options: 'i' } })
      .lean();
    if (contents.length > 0) {
      res.status(200).send(contentsuccess("Video loaded successfully", { contents }))
    }
    else {
      res.status(400).send(error("The content you are looking for is not available"))
    }
  } catch (err) {
    console.log("error in catch", err.message, err);
    res.status(500).send(error("Server error"))
  }
})

contentrouter.put("/update", jwtAuth,async (req, res) => {
  const secretKey = req.headers["x-secret-key"];
  if (!secretKey || secretKey !== headerSecretKey) { //if secret key then only it can be uploaded
    return res.status(401).send(error("Unauthorized."));
  }
  const expectedKeys = ["title", "videolink", "thumbnail", "category", "newtitle"];
  const bodyKeys = Object.keys(req.body);
  
  // if (!expectedKeys.every(key => bodyKeys.includes(key))) {
  //   return res.status(401).send(error("Invalid fields."));
  // }

  if(expectedKeys.length>5){
    return res.status(401).send(error("Invalid fields."));
  }
  const { videolink, thumbnail, title, category, newtitle } = req.body;
  const video = await Contents.findOne({ title });

  if (!video) {
    return res.status(401).send(error("Content you are looking for is not found."))
  }

  try {
    if (videolink && validlength(videolink)) {
      const shortlink = await createPermanentLink(videolink);
      if (!shortlink) {
        return res.status(401).send(error("Unable to generate link may be link is invalid."))
      }
      const permanentLink = 'https://gdurl.com' + shortlink;
      video.videolink = permanentLink;
    }

    if (thumbnail && validlength(thumbnail)) {
      video.thumbnail = thumbnail;
    }

    if (newtitle && validlength(newtitle)) {
      video.title = newtitle;
    }

    if (category && validlength(category)) {
      video.category = category;
    }

    await video.save();
    res.status(200).send(contentsuccess("Video updated successfully", { video }));
  } catch (err) {
    if (err.keyValue) {
      res.status(400).send(error({ "message": Object.keys(err.keyValue) + " is invalid" }));
    } else {
      console.log("error in else catch", err);
      res.status(400).send({ error: error(err.message) });
    }
    console.log("error in catch", err.message, err);
  }
});

contentrouter.delete("/delete",jwtAuth, async (req, res) => {
  const secretKey = req.headers["x-secret-key"];
  if (!secretKey || secretKey !== headerSecretKey) { //if secret key then only it can be uploaded
    return res.status(401).send(error("Unauthorized."));
  }
  const title = req.body.title;
  const expectedKeys=["title"]
  const bodyKeys=Object.keys(req.body)
  if(expectedKeys.length!=bodyKeys.length || !validlength(title) || !req.body){
    return res.status(404).send(error("Invalid input."));
  }
  try {
    const deletedVideo = await Contents.deleteOne(req.body).exec();
    if (deletedVideo.deletedCount === 0) {
      return res.status(404).send(error("Video not found."));
    }
    res.status(200).send(success("Video deleted successfully."));
  } catch (err) {
    console.error(err);
    res.status(500).send(error("Internal server error."));
  }
});

module.exports = contentrouter

//=====================disabled puppeteer====================
/*
'use strict';
const express = require('express')
var app = express();
app.use(express.json());
const { error, success, contentsuccess, validlength } = require('../utils/Constants')
const mongoose = require('mongoose')
const contentrouter = express.Router();
const Contents = require('../models/Content');
const jwtAuth = require('../middleware/authkeys')
const createPermanentLink = require('../scrapper/scripterfornode')
const headerSecretKey = process.env.HEADER_SECRET_KEY;
mongoose.model('Contents')

contentrouter.post("/upload",jwtAuth, async (req, res) => {
  const expectedKeys = ["title", "videolink", "thumbnail", "category"];
  const bodyKeys = Object.keys(req.body);

  //crated my secret key to check if valid user can access my data base
  const secretKey = req.headers["x-secret-key"];
  if (!secretKey || secretKey !== '#heyram@') { //if secret key then only it can be uploaded
    return res.status(401).send(error("Unauthorized."));
  }

  if (bodyKeys.length !== expectedKeys.length || !bodyKeys.includes("title") || !bodyKeys.includes("videolink") || !bodyKeys.includes("thumbnail") || !bodyKeys.includes("category")) {
    return res.status(400).send(error("Invalid fields."))
  }
  const { videolink, thumbnail, title, category } = req.body;
  // console.log("upload", req.body)
  // var lengthofbody = videolink + title + thumbnail + category
  var lengthofbody=Object.keys(bodyKeys).length
  if (!req.body || lengthofbody < 4 || !videolink || !title || !thumbnail || !category) {
    return res.status(400).send(error("unable to generate link as fields are empty"))
  }

  try {
    // const shortlink = await createPermanentLink(videolink)
    const shortlink = videolink;
    
    if (!shortlink) {
      return res.status(400).send(error("unable to generate link may be link is invalid"))
    }
    const permanentLink = 'https://gdurl.com' + shortlink;
    const videos = new Contents({ videolink: shortlink, thumbnail, title,category })
    
    await videos.save();
    res.status(200).send(contentsuccess("Video saved successfully", { videolink: shortlink, thumbnail, title ,category }))
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

contentrouter.get("/load", jwtAuth, async (req, res) => {
  console.log("trying in load");

  try {
    console.log("trying in try");
    var contents = await Contents.find({})
      .clone()
      .catch((err) => { console.log("error in finding user", err) });
    if (contents)
      res.status(200).send(contentsuccess("Video loaded successfully", { contents }))
    else {
      console.log("error in try", err);
      res.status(400).send({ error: error(err.message) })
    }
  } catch (err) {
    console.log("trying in try");
    console.log("error in catch", err.message, err);
  }
})

contentrouter.get("/load/search/:name", jwtAuth, async (req, res) => {
  const expectedKeys = ["title"];
  const bodyKeys = Object.keys(req.body);

  if (bodyKeys.length !== expectedKeys.length || !bodyKeys.includes("title")) {
    return res.status(401).send(error("Invalid fields."))
  }

  const lengthofbody = req.body.title.replace(/\s/g, '').length
  if (!lengthofbody) {
    return res.status(401).send(error("Fields can't be empty."))
  }

  try {
    const contents = await Contents.find({ title: { $regex: req.body.title, $options: 'i' } })
      .lean();
    if (contents.length > 0) {
      res.status(200).send(contentsuccess("Video loaded successfully", { contents }))
    }
    else {
      res.status(400).send(error("The content you are looking for is not available"))
    }
  } catch (err) {
    console.log("error in catch", err.message, err);
    res.status(500).send(error("Server error"))
  }
})

contentrouter.put("/update", jwtAuth,async (req, res) => {
  const secretKey = req.headers["x-secret-key"];
  if (!secretKey || secretKey !== headerSecretKey) { //if secret key then only it can be uploaded
    return res.status(401).send(error("Unauthorized."));
  }
  const expectedKeys = ["title", "videolink", "thumbnail", "category", "newtitle"];
  const bodyKeys = Object.keys(req.body);
  
  // if (!expectedKeys.every(key => bodyKeys.includes(key))) {
  //   return res.status(401).send(error("Invalid fields."));
  // }

  if(expectedKeys.length>5){
    return res.status(401).send(error("Invalid fields."));
  }
  const { videolink, thumbnail, title, category, newtitle } = req.body;
  const video = await Contents.findOne({ title });

  if (!video) {
    return res.status(401).send(error("Content you are looking for is not found."))
  }

  try {
    if (videolink && validlength(videolink)) {
      const shortlink = await createPermanentLink(videolink);
      if (!shortlink) {
        return res.status(401).send(error("Unable to generate link may be link is invalid."))
      }
      const permanentLink = 'https://gdurl.com' + shortlink;
      video.videolink = permanentLink;
    }

    if (thumbnail && validlength(thumbnail)) {
      video.thumbnail = thumbnail;
    }

    if (newtitle && validlength(newtitle)) {
      video.title = newtitle;
    }

    if (category && validlength(category)) {
      video.category = category;
    }

    await video.save();
    res.status(200).send(contentsuccess("Video updated successfully", { video }));
  } catch (err) {
    if (err.keyValue) {
      res.status(400).send(error({ "message": Object.keys(err.keyValue) + " is invalid" }));
    } else {
      console.log("error in else catch", err);
      res.status(400).send({ error: error(err.message) });
    }
    console.log("error in catch", err.message, err);
  }
});

contentrouter.delete("/delete",jwtAuth, async (req, res) => {
  const secretKey = req.headers["x-secret-key"];
  if (!secretKey || secretKey !== headerSecretKey) { //if secret key then only it can be uploaded
    return res.status(401).send(error("Unauthorized."));
  }
  const title = req.body.title;
  const expectedKeys=["title"]
  const bodyKeys=Object.keys(req.body)
  if(expectedKeys.length!=bodyKeys.length || !validlength(title) || !req.body){
    return res.status(404).send(error("Invalid input."));
  }
  try {
    const deletedVideo = await Contents.deleteOne(req.body).exec();
    if (deletedVideo.deletedCount === 0) {
      return res.status(404).send(error("Video not found."));
    }
    res.status(200).send(success("Video deleted successfully."));
  } catch (err) {
    console.error(err);
    res.status(500).send(error("Internal server error."));
  }
});

module.exports = contentrouter

*/