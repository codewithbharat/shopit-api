const ErrorHadler = require('../utils/errorHandler');


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    if(process.env.NODE_ENV === 'DEVELOPMENT'){
        res.status(err.statusCode).json({
            success: false,
            error : err,
            errorMessage: err.message,
            stack: err.stack
        });
    }

    if (process.env.NODE_ENV === 'PRODUCTION'){
        let error = {...err}

        error.message = err.message;

        // wrong Mongose Object ID error
        if(err.name === 'CastError'){
            const message = `Resource not found. invalid: ${err.path}`
            error = new ErrorHadler(message, 400)
        }

        // Handeling Mongoose Validation Error
        if(err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(value => value.message);
            error = new ErrorHadler(message, 400);
        }

        // Handeling the Mongoose duplicate key error
        if(err.code == 11000){
            const message = `Duplicate ${Object.keys(err.keyValue)} entered`
            error = new ErrorHadler(message, 400)
        }

        // Handeling wrong JWT error
        if(err.name === 'jsonWebTokenError'){
            const message = 'JSON web Token is invalid. Try Again!!!'
            error = new ErrorHadler(message, 400);
        }

        // Handeling wrong JWT error
        if(err.name === 'TokenExpiredError'){
            const message = 'JSON web Token is Expired. please generate new token.'
            error = new ErrorHadler(message, 400);
        }

        res.status(error.statusCode).json({
            success: false,
            message: error.message || 'Internal Srever Error'
        });
    }
}   