const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: [true,'Email Exist'],
    },
    password: {
        type: String,
        required: [true,'Please provide a password'],
        unique: false,
    },
    avatar: {
        type: Buffer,
        required: false,
    }

});

const User = mongoose.model("User", UserSchema);
module.exports = User;