const app = require('./app');
const connectDatabase = require('./config/database');

const dotenv = require('dotenv');

//Handle Uncaught exceptions
process.on('uncaughtException', err =>{
    console.log(`Error: ${err.message}`);
    console.log('Sutting down server due to uncaught exceptions');
    process.exit(1)
})

// setting up config file
dotenv.config({path : 'backend/config/config.env'});

//connecting to database
connectDatabase();

const server = app.listen(process.env.PORT, () => {
    console.log(`server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});

// Handle Unhandled Promise rejections
process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down the server due to unhandled Promise rejection');
    server.close(() =>{
        process.exit(1)
    })
});