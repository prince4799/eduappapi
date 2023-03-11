'use strict';
const express = require('express')
const body=require('body-parser')
const mongoose=require('mongoose')
const bodyParser = require('body-parser');

const app = express()
const port = 5500
app.use(express.json());
const {mongoUrl}=require("./src/confidential/mongoKey")

require('./src/models/User')
const jwtAuth=require('./src/middleware/authkeys')
const router=require('./src/routes/authroutes');
const contentrouter=require('./src/routes/contentroute')
const categoryrouter= require('./src/routes/categoryRoute')
// const linkrouter=require("./scrapper")
app.use(bodyParser.json())
app.use("/contents",contentrouter)
app.use("/auth",router)
app.use('/category',categoryrouter)
// app.use(linkrouter)


app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

mongoose.connect(mongoUrl,{
  useNewUrlParser: false,
  useUnifiedTopology: true,
  // useNewUrlParser: true,
  // useCreateIndex: true, //make this true
  autoIndex: true,})

mongoose.set('strictQuery', false)

mongoose.connection.on('connected',()=>{
  console.log("You are now connected to mongo");
  
})

mongoose.connection.on('error',(err)=>{
  console.log("not connected to the mongo",err);
  
})

app.post('/', jwtAuth,(req, res,next) => {
    res.status(200).send("You get that"+req.body.msg)
    // return next();
  })

  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
 