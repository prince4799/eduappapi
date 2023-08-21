'use strict';


const express = require('express')
// const body=require('body-parser')
const mongoose = require('mongoose')
var mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express()
// const port = 5500
app.use(express.json());
const { mongoUrl } = require("./src/confidential/mongoKey")
const {mongoDb}=require("./src/confidential/mongoConnection")
// const { con }  = require('./src/confidential/sqlConnetion'); 
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
require('dotenv').config();

// Access the environment variables
const port = process.env.PORT || 3000; // Use 3000 as a default port if PORT is not defined
const secretKey = process.env.SECRET_KEY;
const secretValue = process.env.SECRET_VALUE;



app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

//====================Socket.io=========================//
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('new_visitor', (user) => {
    console.log('a new user visited ', user);
    socket.user = user;
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
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
