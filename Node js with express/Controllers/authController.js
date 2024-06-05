const User = require('./../Models/userModel');
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')
const jwt = require('jsonwebtoken');
const CustomError = require('./../Utils/CustomError');
const sendEmail = require('./../Utils/email');
const crypto = require('crypto');

const util = require('util');

const signToken = id=>{
    return jwt.sign({ id }, process.env.JWT_SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })
}
const createSendResponse = (user, statusCode, res)=>{
    const token = signToken(user._id);

    const options = {
        maxAge: process.env.LOGIN_EXPIRES,
        httpOnly: true
    }
    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }
    res.cookie('jwt', token, options);
    user.password = undefined; 5

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = asyncErrorHandler(async (req, res, next) =>{
    const newUser = await User.create(req.body);

    createSendResponse(newUser, 201, res);
});

exports.login = asyncErrorHandler(async (req, res, next)=>{

    const email = req.body.email;
    const password = req.body.password;
    //const {email, password} = req.body;

    //check if email and password is present in request body
    if(!email || !password){
        const error = new CustomError("Please provide email and password for login", 400);
        return next(error);
    }

    //check if user exists with given email
    const user = await User.findOne({ email }).select('+password');

    //check if the user exists and password matches
    if(!user || !(await user.comparePasswordInDb(password, user.password))){
        const error = new CustomError("Incorrect email or password", 400);
        return next(error);
    }

    createSendResponse(user, 200, res);   
})

exports.protect = asyncErrorHandler(async (req, res, next)=>{
    //1. Read the token and check if it exists:
    
    // the common practice to send token with request is by using http headers with request
    const testToken = req.headers.authorization;
    let token;
    if(testToken && testToken.startsWith('Bearer')){
        token = testToken.split(' ')[1];
    }
    if(!token){
        next(new CustomError('you are not logged in', 401))
    }
    //console.log(token);

    //2. validate the token:
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET_STR);
    console.log(decodedToken);

    //3. if the user exists (might be user logged in and immediately user has been delete from DB for some reason):
    const user = await User.findById(decodedToken.id);
    if(!user){
        const error = new CustomError('The user belonging to this token does no longer exist', 401)
        next(error);
    }

    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat)
    //4. if the user changed password after the token was issued:
    if(isPasswordChanged){
        const error = new CustomError('User recently changed password. Please login again', 401);
        return next(error);
    }

    //5. Allow user to access route:
    req.user = user;
    next();
})

exports.restrict = (role)=>{
    return (req, res, next)=>{
        if(req.user.role !== role){
            const error = new CustomError("You don't have permission to perform this action", 403);
            next(error);
        }
        next();
    }
}

exports.forgotPassword = asyncErrorHandler(async (req, res, next)=>{
    //1. GET USER BASED ON POSTED EMAIL:
    const user = await User.findOne({email: req.body.email});
    if(!user){
        const error = new CustomError("Couldn't find user with given email", 404);
        next(error);
    }

    //2. GENERATE A RANDOM RESET TOKEN:
    const resetToken = user.createResetPasswordToken();
    await user.save({validateBeforeSave: false});

    //3. SEND THE TOKEN BACK TO THE USER EMAIL:
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    console.log(resetUrl);

    const message = `We have received a password reset request. Please use the below link to reset your password.\n\n${resetUrl}\n\nThis link is valid for 10 minutes only.`;

    try{
        await sendEmail({
            email: user.email,
            subject: "Password change request received",
            message: message
        });
        res.status(200).json({
            status: 'success',
            message: 'Password reset link sent to user email'
        })
        
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetToeknExpires = undefined;
        user.save({validateBeforeSave: false})

        return next(new CustomError("There was an error in sending password reset email. Please try again later.", 500))
    }
})

exports.resetPassword = asyncErrorHandler(async (req, res, next)=>{
    //1. IF THE USER EXISTS WITH THE GIVEN TOKEN & TOKEN HAS NOT EXPIRED:
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken: token, passwordResetToeknExpires: {$gt: Date.now()}});

    if(!user){
        const error = new CustomError("Token is invalid or expired", 400);
        next(error);
    }

    //2. RESETING THE USER PASSWORD:
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    user.passwordResetToken = undefined;
    user.passwordResetToeknExpires = undefined;
    user.passwordChangedAt = Date.now();

    console.log("reset done")

    //3. LOGIN THE USER:
    try {
        await user.save();
        
        createSendResponse(user, 200, res);
        console.log("login");
    } catch (err) {
        console.log("no login")
        return next(new CustomError(err.message, 400)); // Catch validation errors
    }
})

exports.createSendResponse = createSendResponse;