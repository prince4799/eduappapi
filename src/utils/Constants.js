const datetime = new Date();

const error = (message = '') => {

    return {
        message: message,
        status: false,
        timestamp: datetime.toLocaleString(),
        status: 401
    }
}

const success = (message, token, screen = null) => {

    const successRes = {
        message: message,
        status: true,
        timestamp: datetime.toLocaleString(),
        status: 200
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
        status: 200,
        details: videoDetails
    }

    return successRes
}

const validlength = (param) => {
    return param.replace(/\s/g, '').length
}

module.exports = { error, success, contentsuccess, validlength }