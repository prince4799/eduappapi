'use strict';
const express = require('express')
var app = express();
app.use(express.json());
const mysql = require('mysql');
const { error, success, contentsuccess, validlength } = require('../utils/Constants')
const jwtAuth = require('../middleware/authkeys')
const headerSecretKey = process.env.HEADER_SECRET_KEY;
const { jsonLimiter, validateRequestBodySize } = require('../middleware/jsonLimiter');
const requestlimiter = require("../middleware/requestLimiter");
const { sqlDb } = require('../confidential/sqlConnetion');

const historyRoute = express.Router();

const TAG = 'historyroute'

historyRoute.get("/", (req, res, next) => {
  res.status(200).send("You are now connected to Mysql")
})


historyRoute.post("/show/lastactivities", requestlimiter, jwtAuth, jsonLimiter, validateRequestBodySize, async (req, res) => {

  const bodyKeys = Object.keys(req.body)
  const expectedKeys = ["userid"]
  if (bodyKeys.length != expectedKeys.length || !validlength(req.body.userid)) {
    return res.status(401).send(error("Invalid Fields"))
  }
  const { userid } = req.body
  if (!userid) {
    return res.status(401).send(error('Email/Username is missing.'));
  }
  const selectQuery = `
  SELECT * FROM history
  WHERE username=?
  `
  try {
    sqlDb.query(selectQuery, [userid], (err, result) => {
      if (err) {
        console.error("Error in getting data from history:", err);
        return res.status(401).send(error(err))
      }
      const newData=JSON.parse(result[0].data)
      if (!newData) {
        console.error("Error in getting data from history:", err);
        return res.status(200).send(contentsuccess("No data found",{}))
      }
      const finalData=newData.map(item=>{
        return JSON.parse(item)
      })

      const newObj={
        id:result[0].id,
        username:result[0].username,
        data:finalData
      }
      // console.log("Data fetched ", newObj);
      return res.status(200).send(contentsuccess("Data fetched successfully from history", newObj))
    });

    if (!userid) {
      return res.status(401).send(error('Email/Username is missing.'));
    }

  } catch (err) {
    console.error("An unexpected error occurred:", err);
    return res.status(500).send(error("An unexpected error occurred."));
  }



})


historyRoute.put("/update/lastactivities", requestlimiter, jwtAuth, jsonLimiter, validateRequestBodySize, async (req, res) => {
  console.log("req.body", req.body);
  const bodyKeys = Object.keys(req.body)
  const expectedKeys = ["userid", "value"]
  if (bodyKeys.length != expectedKeys.length || !validlength(req.body.userid) || !validlength(req.body.value)) {
    return res.status(401).send(error("Invalid Fields"))
  }

  const { userid, value } = req.body;

  const newValue=JSON.stringify(value)
  if (!userid) {
    return res.status(400).send(error('Email/Username is missing.'));
  }
  const insertDataQuery = `
  UPDATE history
  SET data = 
  CASE
  WHEN data IS NULL THEN JSON_ARRAY(?)
  WHEN JSON_UNQUOTE(JSON_EXTRACT(data, CONCAT('$[', JSON_LENGTH(data) - 1, ']'))) = ? THEN data
  WHEN JSON_LENGTH(data) >= 10 THEN JSON_ARRAY_APPEND(JSON_REMOVE(data, '$[0]'), '$', ?)
  ELSE JSON_ARRAY_APPEND(data, '$', ?)
  END
  WHERE username = ?;
`;
  try {

    sqlDb.query(insertDataQuery, [newValue, newValue, newValue,newValue, userid], (err, result) => {
      if (err) {
        console.error("Error inserting data into history:", err);
        return res.status(401).send(error(err))
      }
      console.log("Data inserted successfully into history", result);
      return res.status(200).send(success("Data inserted successfully into history", result.message))
    });
  } catch (err) {
    console.error("An unexpected error occurred:", err);
    return res.status(500).send(error("An unexpected error occurred."));
  }
})


module.exports = historyRoute;