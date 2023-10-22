const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        phoneNumber: {
            type: String
        },
        user_id: {
            type: String

        },
        email: {
            type: String
        },
        password: {
            type: String
        },
        image: {
            type: String
        },
        isVerify: {
            type: Boolean,
            default: false
        },
        code: {
            type: String
        },
        coin:{
            type:Number,
            default:0
        },
        role:{
            type:String,
            enum:["admin"]
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("user", userSchema);