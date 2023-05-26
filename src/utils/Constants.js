const datetime = new Date();
const myRegex = /^[a-zA-Z0-9!#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,10}$/;
const error = (message = '') => {

    return {
        message: message,
        status: false,
        timestamp: datetime.toLocaleString(),
        statuscode: 401
    }
}
/*
const success = (message, screen = null, ...optionalParams) => {
    const optionalObj = optionalParams.reduce((obj, value, index) => {
        if (['email', 'username', 'contact', 'token'].includes(value)) {
          obj[value] = optionalParams[index + 1];
        }
        return obj;
      }, {});
      
      const { email, username, contact, userType, token } = optionalObj;
      
      const user = { email, username, contact, userType, token };
      
      const successRes = {
        message: message,
        status: true,
        timestamp: datetime.toLocaleString(),
        statuscode: 200,
        user: user,
      };
      
      console.log('successRes', successRes);
    if (message.includes("Successfully logged in")) {
        successRes.screen = screen;
    }
    optionalParams.forEach((param, index) => {
        successRes[`${Object.keys(param)}`] = param;
    });

    return successRes
}
*/
const success = (message, token = null, ...optionalParams) => {

  const userObj={}

  optionalParams.forEach(item => {
    Object.assign(userObj, item);
});

  const successRes = {
      message: message,
      status: true,
      timestamp: datetime.toLocaleString(),
      statuscode: 200,
      data: userObj,
    };
    if (token) {
      successRes.token = token;
    }
    return successRes;
  };
  

const contentsuccess = (message, videoDetails) => {

    const successRes = {
        message: message,
        status: true,
        timestamp: datetime.toLocaleString(),
        statuscode: 200,
        details: videoDetails
    }

    return successRes
}

const validlength = (param) => {
    if (param.length > 25) {
        return 0
    }
    const validString = param + ' '
    return validString.replace(/\s/g, '').length
}

// const mcuValidator=(param)=>{
// const myRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,10}$/;

// if (myRegex.test(param)) {

// }

// }

/*
const validlength = (param, min, max) => {
    const validString = param.trim();
    const length = validString.length;
    return length >= min && length <= max;
  }
  */
const multiArgFunc = () => {
    // Access all the arguments passed to the function using the 'arguments' object
    for (var i = 0; i < arguments.length; i++) {
        console.log("\n", arguments[i]);
    }
}

module.exports = { error, success, contentsuccess, validlength, multiArgFunc }