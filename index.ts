'use strict';
const express = require('express')
// const body=require('body-parser')
const mongoose = require('mongoose')
var mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express()
const port = 5500
app.use(express.json());
const { mongoUrl } = require("./src/confidential/mongoKey")
const {mongoDb}=require("./src/confidential/mongoConnection")
const { con }  = require('./src/confidential/sqlConnetion'); 
require('./src/models/User')
require('./src/models/Admin')
const jwtAuth = require('./src/middleware/authkeys')
const router = require('./src/routes/authroutes');
const contentrouter = require('./src/routes/contentroute')
const categoryrouter = require('./src/routes/categoryRoute')
const adminrouter = require('./src/routes/adminroute')
const historyRoute=require("./src/routes/historytroute")
// const linkrouter=require("./scrapper")
// app.use(bodyParser.json())
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use("/contents", contentrouter)
app.use("/auth", router)
app.use('/category', categoryrouter)
app.use('/admin', adminrouter)
app.use('/history',historyRoute)
// app.use(linkrouter)


app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});


//======================MongoDB=========================//

// mongoose.connect(mongoUrl, {
//   // useNewUrlParser: false,
//   useUnifiedTopology: true,
//   useNewUrlParser: true,
//   // useCreateIndex: true, //make this true
//   connectTimeoutMS: 0, // 30 seconds
//   socketTimeoutMS: 0, // 30 seconds
//   autoIndex: true,
// })

// mongoose.set('strictQuery', false)

// mongoose.connection.on('connected', () => {
//   console.log("You are now connected to mongo");

// })
// mongoose.connection.on('error', (err) => {
//   console.log("not connected to the mongo", err);

// })


//======================MySQL=========================//



//======================Default Route=========================//

app.post('/', (req, res, next) => {
  res.status(200).send("You get that")
})

//======================Port connection=========================//

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
