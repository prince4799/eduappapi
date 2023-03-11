const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { jwtKey } = require('../confidential/jwtKey')
const User = mongoose.model('User')
// const Videos=mongoose.model('Contents')
const ObjectId = mongoose.Types.ObjectId;
const JWT_ALGORITHM = 'HS256'

module.exports = (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).send("You must be logged in.")
    }
    const token = authorization.replace("Bearer", "");
    jwt.verify(token, jwtKey, { algorithms: [JWT_ALGORITHM] },(err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
        req.user = user;
        next();
      });
    // const decoded=jwt.verify(token, jwtKey, async (err, payload) => {
    //     if (err) {
    //         return res.status(401).send("Unauthorized user");
    //     }})
    //     const user = User.findById({ _id: decoded.userId });
    //     console.log("===========>",user.schema);

        // const { userID } = payload
      /*  if (mongoose.isValidObjectId(userID)) {
             user = await User.findById(ObjectId(userID), (err) => {
                if (err) {
                    console.log("error..", err, userID);
                    return res.status(401).send(err);
                }
            }).clone().catch(function (err) {
                console.log(">>>>", err);
                return res.status(401).send(err);
            });
        req.user = user;
        console.log("<><>",req.user);

        }
        else {
            return res.status(401).send(err);
        }
        req.user = user;
        console.log(">>>>>>>",req.user);
        return next();
    })
    console.log(">>>>>>",decoded);*/
}


// User.findById(new ObjectID(leave.userId), function (err, user) {
    // user.filedLeaves.pull(leave._id);
    // user.save();
//   });
//   next();

// try {
//     const decoded = jwt.verify(token, secretKey);
//     const user = User.findOne({ _id: decoded.userId }); // Replace with your User schema query
//     return user;
//   } catch (err) {
//     console.error(err);
//     return null;
//   }


// function verifyToken(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (authHeader) {
//       const token = authHeader.split(' ')[1];
//       jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//         if (err) {
//           return res.sendStatus(403);
//         }
//         req.user = user;
//         next();
//       });
//     } else {
//       res.sendStatus(401);
//     }
//   }