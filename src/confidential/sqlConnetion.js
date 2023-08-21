'use strict';
const express = require('express')
var app = express();
app.use(express.json());
const mysql = require('mysql');
const { success, error } = require('../utils/Constants');

/*
const con = mysql.createConnection({
  host: "sql6.freesqldatabase.com",
  database: "sql6633286",
  user: "sql6633286",
  password: "k8n3JHEPfL",
  port: 3306,
  connectTimeout: 0
});
*/
const sqlDb = mysql.createConnection({
  host: "db4free.net",
  database: "history_edu_app",
  user: "prince4799",
  password: "prince4799@db4free",
  port: 3306,
  connectTimeout: 0
})
// ==================================freesqldatabase===============================
/*
con.connect((err) => {
  if (err) {
    console.error("Error connecting to freesqldatabase MySQL:", err);
    return;
  }
  console.log("Connected to freesqldatabase MySQL!");
  con.query('SELECT VERSION()', (err, result) => {
    if (err) {
      console.error("Error retrieving freesqldatabase MySQL version:", err);
      return;
    }
    const version = result[0]['VERSION()'];
    console.log("freesqldatabase MySQL version:", version);
  });

  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    data TEXT 
  )
`;
  con.query(createTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating table in freesqldatabase:", err);
      res.status(500).send(error("Failed to create table in freesqldatabase"));

    } else {
      console.log("Table created successfully in freesqldatabase");
    }
  });
})
*/
// ===================================db4free===========================
sqlDb.connect((err) => {
  if (err) {
    console.error("Error connecting to db4free MySQL:", err);
    return;
  }
  console.log("Connected to db4free MySQL!");
  sqlDb.query('SELECT VERSION()', (err, result) => {
    if (err) {
      console.error("Error retrieving db4free MySQL version:", err);
      return;
    }
    const version = result[0]['VERSION()'];
    console.log("db4free MySQL version:", version);
  });


  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    data JSON DEFAULT NULL
    )
`;

  sqlDb.query(createTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating table in db4free:", err);
      res.status(500).send(error("Failed to create table in db4free"));

    } else {
      console.log("Table created successfully in db4free");
    }
  });
})

module.exports = {  sqlDb }

// module.exports = { con, sqlDb }
