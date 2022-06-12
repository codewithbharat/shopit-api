// Create and send token and save in the coookie.
const sendToken = (user, statusCode, res) => {

    //create Jwt Token
    const token = user.getJwtToken();

    // Options for cookie 
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }

    res.status(statusCode).cookie('token',token, options).json({
        success: true,
        token,
        user
    })

}

module.exports = sendToken