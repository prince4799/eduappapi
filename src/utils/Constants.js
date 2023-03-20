const datetime = new Date();

const error = (message = '') => {

    return {
        message: message,
        status: false,
        timestamp: datetime.toLocaleString(),
        statuscode: 401
    }
}

const success = (message, token, screen = null) => {

    const successRes = {
        message: message,
        status: true,
        timestamp: datetime.toLocaleString(),
        statuscode: 200
    }
    successRes.token = token;
    if (message.includes("Successfully logged in")) {
        successRes.screen = screen;
    }
    return successRes
}

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
    if(param.length>25|| myRegex.test(param) ){
        return 0
    }
    const validString=param+' '
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
const multiArgFunc=()=> {
    // Access all the arguments passed to the function using the 'arguments' object
    for (var i = 0; i < arguments.length; i++) {
      console.log("\n",arguments[i]);
    }
  }

module.exports = { error, success, contentsuccess, validlength ,multiArgFunc}