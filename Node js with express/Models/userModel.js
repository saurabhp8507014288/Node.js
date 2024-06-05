const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true, // not a validator, will transform email into lowercase before saving to DB
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String, // store the path of photo
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false // will not show up in any output
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on CREATE and SAVE
            validator: function(val){
                return val === this.password;
            },
            message: 'Passwords are not the same!'
        }
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetToeknExpires: Date
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined; //becoz we want passwordConfirm to confirm the same value, we don't want to store it in out database
    next();
})
userSchema.pre(/^find/, function(next){
    this.find({active: {$ne: false}});
    next();
})
userSchema.methods.comparePasswordInDb = async function(pswd, pswdDB){
    return await bcrypt.compare(pswd, pswdDB);
}
userSchema.methods.isPasswordChanged = async function(JWTTimestamp){
    if(this.passwordChangedAt){
        const pswdChangedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000, 10);
        console.log(pswdChangedTimestamp, JWTTimestamp);
        return JWTTimestamp < pswdChangedTimestamp;
    }
    return false;
}
userSchema.methods.createResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); // encrypted reset token will be saved in database
    this.passwordResetToeknExpires = Date.now()+10*60*1000; // 10 minutes

    console.log(resetToken, this.passwordResetToken);

    return resetToken; // user will get plain reset token
}


const User = mongoose.model('User', userSchema);
module.exports = User;