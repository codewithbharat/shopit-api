const User = require('../models/user');

const ErroHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken= require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { send } = require('process');

// Register a user  => /api/v1/register

exports.registerUser = catchAsyncErrors( async (req, res, next) => {
    const { name, email, password} = req.body;
    
    const user = await User.create({
        name,
        email,
        password,
        avator: {
            public_id: '',
            url: '',
        }
    });

   sendToken(user, 200, res);
});


// login user => /api/v1/login

exports.loginUser = catchAsyncErrors(async(req, res, next) => {
    const {email, password} = req.body;

    //Checks if email and password is enterd by user
    if(!email || !password){
        return next(new ErroHandler('Please enter email & password', 400))
    }

    //Finding user in database
    const user = await User.findOne({ email }).select('+password');

    if(!user){
        return next(new ErroHandler('Invalid Email or Password', 401));
    }

    //checks if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErroHandler('Invalid Email or Password', 401));
    }

    sendToken(user, 200, res);
});

// Forgot Password => /api/v1/passwords/forgot

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    
    const user = await User.findOne({ email: req.body.email});

    if(!user){
        return next(new ErroHandler('User is not registered with this email', 404));
    }

    // get reset token
    const resetToken = user.getResetPasswordToken();
    
    await user.save({ validateBeforeSave: false });

    // create reset password url

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `your Password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`

    try {

        await sendEmail({
            email: user.email,
            subject: 'ShopIT Password Recovery',
            message
        });

        res.status(200).json({
            success: true,
            message: `Reset Link sent to you email ${user.email}`
        });

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.restPasswordExpire = undefined;

        await user.save({ validatebeforeSave: false});

        return next( new ErroHandler(error.message, 500));
    }


    
});

// Reset Password => /api/v1/passwords/forgot

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    
    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now()}
    });

    if(!user) {
        return next( new ErroHandler('Password Reset token is invalid or has been expired', 400));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErroHandler('Password does not match', 400));
    }

    //setup new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.restPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);

});

// Get currently logged in user details =>  /api/v1/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
})

// Update/change password => /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')

    // check previous user password
    const isMatched = await user.comparePassword(req.body.oldpassword)

    if(!isMatched) {
        return next(new ErroHandler('Old password is incorrect'));
    }

    user.password = req.body.password;

    await user.save();

    sendToken(user, 200, res);
})

// Update user profile => /api/v1/me/update

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    // Update avatar : TODO

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true
    })
})


// Logout user =>  /api/v1/logout

exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out'
    })
});


// admin routes

//get all users => /api/v1/admin/users

exports.allUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    });
});

// get user details => /api/v1/admin/user.:id

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErroHandler(`user does not found with id : ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
});

// Update user profile => /api/v1/admin/user/:id

exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true
    })
});


// Delete user => /api/v1/admin/user.:id

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErroHandler(`user does not found with id : ${req.params.id}`))
    }

    // Remove avator from cloudinary - TODO

    await user.remove()

    res.status(200).json({
        success: true,
        message: `user ${user.name} has been removed`
    })
});
