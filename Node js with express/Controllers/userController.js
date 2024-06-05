const User = require('./../Models/userModel');
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')
const jwt = require('jsonwebtoken');
const CustomError = require('./../Utils/CustomError');
const sendEmail = require('./../Utils/email');
const crypto = require('crypto');

const { createSendResponse } = require('./authController'); // Import the function

const util = require('util');

exports.getAllUsers = asyncErrorHandler(async (req, res, next)=>{
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        result: users.length,
        data: {
            users
        }
    })
})

const filterReqObj = (obj, ...allowedFields)=>{
    const newObj = {};
    Object.keys(obj).forEach(prop=>{
        if(allowedFields.includes(prop)){
            newObj[prop] = obj[prop];
        }
    })
    return newObj;
        
}


exports.updatePassword = asyncErrorHandler(async (req, res, next)=>{
    // GET CURRENT USER DATA FROM DATABASE:
    const user = await User.findById(req.user._id).select('+password');

    // CHECK IF THE SUPPLIED CURRENT PASSWORD IS CORRECT:
    if(!(await user.comparePasswordInDb(req.body.currentPassword, user.password))){
        return next(new CustomError("Current password you provided is wrong", 401));
    }

    // IF SUPPLIED PASSWORD IS CORRECT, UPDATE USER PASSWORD WITH NEW VALUE:
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // lOGIN USER & SEND JWT:
    createSendResponse(user, 200, res);
})

exports.updateMe = asyncErrorHandler(async (req, res, next)=>{
    // 1) Create error if user POSTs password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new CustomError('This route is not for password updates. Please use /updatePassword', 400))
    }

    // 2) Update user document
    const filterObj = filterReqObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterObj, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
})

exports.deleteMe = asyncErrorHandler(async (req, res, next)=>{
    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
        status: 'success',
        data: null
    })
})
