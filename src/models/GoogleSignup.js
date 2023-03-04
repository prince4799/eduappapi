const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true });

// define schema for user data, including extra parameters
const userSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  firstName: String,
  lastName: String,
  extraParameter: String // add your extra parameters here
});

// create model for user data
const User = mongoose.model('User', userSchema);

// configure passport with GoogleStrategy
passport.use(new GoogleStrategy({
    clientID: YOUR_CLIENT_ID,
    clientSecret: YOUR_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // handle user data, including extra parameters if needed
    const userData = {
      googleId: profile.id,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      extraParameter: 'some value' // add your extra parameters here
    };
    User.findOneAndUpdate({ googleId: profile.id }, userData, { upsert: true }, function(err, user) {
      return done(err, user);
    });
  }
));

// configure app to use passport middleware
app.use(passport.initialize());
app.use(passport.session());

// create login route
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// create callback route
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // handle user authentication
    res.redirect('/');
  });

// start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
























//=============================================================================================//

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true });

// define schema for user data, including extra parameters
const userSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  firstName: String,
  lastName: String,
  extraParameter: String // add your extra parameters here
});

// create model for user data
const User = mongoose.model('User', userSchema);

// configure passport with GoogleStrategy
passport.use(new GoogleStrategy({
    clientID: YOUR_CLIENT_ID,
    clientSecret: YOUR_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // handle user data, including extra parameters if needed
    User.findOne({ googleId: profile.id }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Unknown user' });
      }
      return done(null, user);
    });
  }
));

// configure app to use passport middleware
app.use(passport.initialize());
app.use(passport.session());

// create login route
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// create callback route
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // handle user authentication
    res.redirect('/');
  });

// start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});




//========================gdurl======================================//

const express = require('express');
const app = express();
const gdurl = require('gdurl');

// create a new route to generate the short URL
app.get('/shorten', function(req, res) {
  const gdurlParam = req.query.gdurl;

  // generate the short URL using gdurl
  gdurl.shorten(gdurlParam, function(err, shortUrl) {
    if (err) {
      console.log(err);
      res.status(500).send("Error generating short URL");
    } else {
      // send the short URL as the response to the client
      res.send(shortUrl);
    }
  });
});

// start the server
app.listen(3000, function() {
  console.log('Server listening on port 3000');
});
