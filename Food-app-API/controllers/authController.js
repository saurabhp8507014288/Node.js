const userModel = require("../models/userModel");
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');

// Register
const registerController = async (req, res)=> {
    try {
        const {userName, email, password, phone, address, answer} = req.body;

        if(!userName || !email || !password || !address || !phone || !answer){
            return res.status(500).send({
                success: false,
                message: "Please provide all fields"
            })
        }

        //check existing user
        const existing = await userModel.findOne({email});
        if(existing){
            return res.status(500).send({
                success: false,
                message: "Email already registered. Please login again"
            })
        }

        //hashing password
        var salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create new user
        const user = await userModel.create({
            userName,
            email,
            password: hashedPassword,
            phone,
            address, 
            answer
        });
        res.status(201).send({
            success: true,
            message: "Successfully registered",
            user
        })
    } catch(error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in register API",
            error
        })
    }
};

//Login
const loginController = async (req, res)=> {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(500).send({
                success: false,
                message: "Please provide email and password"
            })
        }
        //check user
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(500).send({
                success: false,
                message: "User not found"
            })
        }

        // check user password | compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(500).send({
                success: false,
                message: "Password is incorrect"
            })
        }

        //token
        const token = JWT.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"});

        user.password = undefined; // to hide password in response
        res.status(200).send({
            success: true,
            message: "Login successfully",
            token,
            user
        })
    } catch(error){
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in login API",
            error
        })
    }
};

module.exports = {registerController, loginController};