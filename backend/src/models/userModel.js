const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true
    },
    fullName : {
        firstName : {
            type : String
        },
        lastName : {
            type : String
        }   
    },
    password : {
        type : String,
        required : true
    }
},{
    timestamps : true
});

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;