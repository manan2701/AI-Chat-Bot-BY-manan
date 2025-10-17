const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const {email, password, fullName: {firstName, lastName}} = req.body;

    const isUserRegistered = await userModel.findOne({email});
    if(isUserRegistered){
        return res.status(400).json({message: "User already registered"});
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
        email, 
        password: hashPassword, 
        fullName: {firstName, lastName}
    })

    const token = jwt.sign({userId: newUser._id},process.env.JWT_SECRET);
    res.cookie("token", token);

    return res.status(201).json({
        message: "User registered successfully", 
        user: newUser
    });
}

const login = async (req,res) =>{
    const {email, password} = req.body;

    const user = await userModel.findOne({email});
    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if(!user || !isPasswordMatched){
        return res.status(401).json({message: "Invalid credentials"});
    }

    const token = jwt.sign({userId: user._id},process.env.JWT_SECRET);
    res.cookie("token", token);

    res.status(200).json({
        message: "Login successful",
        user
    });
}

module.exports = {register, login};
