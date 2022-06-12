// Error Handler Class
class ErrorHadler extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = ErrorHadler;