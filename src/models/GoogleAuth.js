const passport=require('passport')
const GoogleStrategy = require('passport-google-oauth20');
const {CLIENT_ID,CLIENT_SECRET} =require('../confidential/googlekeys')


 passport.use(new GoogleStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: "/auth/login/redirect"
  },(accessToken, refreshToken, profile, cb)=> {
    console.log(profile,accessToken,refreshToken);
    console.log(">>>>>>>>>");

    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
    // //   return cb(err, user);
    // if(err)
    // console.log(err);
    // else
    // console.log(user);
    // });
  },console.log("we are here")
));   


