const express = require('express');
const mongoose = require('mongoose')

const app = express();
app.use(express.json());
const { mongoUrl } = require("./mongoKey")

mongoose.set('strictQuery', false)

const mongoDb = mongoose.connect(mongoUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    connectTimeoutMS: 0,
    socketTimeoutMS: 0,
    autoIndex: true,
  });

// mongoose.connect(mongoUrl, {
//     // useNewUrlParser: false,
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
//     // useCreateIndex: true, //make this true
//     connectTimeoutMS: 0, // 30 seconds
//     socketTimeoutMS: 0, // 30 seconds
//     autoIndex: true,
//   })
  
  
  mongoose.connection.on('connected', () => {
    console.log("You are now connected to mongo");
  
  })
  mongoose.connection.on('error', (err) => {
    console.log("not connected to the mongo", err);
  
  })

  module.exports = mongoDb