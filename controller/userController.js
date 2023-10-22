const userModel = require("../model/userModel")
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const uuid = require('uuid');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const config = require("../config/config");
const jwt = require("jsonwebtoken")
var CryptoJS = require("crypto-js");
const gameModel = require("../model/gamePlayModel");
const ledgerModel = require("../model/ledgerModel");
const moneyRequestModel = require("../model/moneyRequestModel");
const path = require("path")
const express = require("express");
const viewPath = path.resolve(__dirname, '../views');
const partialsPath = path.resolve(__dirname, "../views/partials");
const fs = require('fs');
const handlebars = require('handlebars');
const templateSource = fs.readFileSync('views/resettingYourPassword.handlebars', 'utf8');
const template = handlebars.compile(templateSource)
const publicDir = require('path').join(__dirname, '../uploads');
const aesjs = require('aes-js');
const crypto = require('crypto');
const gamePlayModel = require("../model/gamePlayModel");
const tableModel = require("../model/tableModel");
const helper = require("../middleware/helper").encrypt
const helperDecypt = require("../middleware/helper").decryption

const ENC_KEY = "A60A5770FE5E7AB200BA9CFC94E4E8B0"
const IV = "1234567887654321";


const handlebarOptions = {
    viewEngine: {
        extName: ".handlebars",
        partialsDir: viewPath,
        layoutsDir: viewPath,
        defaultLayout: false,
        partialsDir: partialsPath,
        express,
    },
    viewPath: viewPath,
    extName: ".handlebars",
};

let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,//587,
    secure: true, // true for 465, false for other ports
    auth: {
        user: config.emailUser,
        pass: config.emailPass,
    },
});

exports.registration = async (req, res) => {
    try {
        const reqBody = req.body
        const { name, email, password, phoneNumber } = reqBody

        if (!name || !email || !password) {
            let encryptError = helper({ responseCode: 200, success: false, responseMessage: "All fields are required" })
            const decryptedData = helperDecypt(encryptError);
            console.log(decryptedData);

            return res.send({ encryptedData: encryptError })
            // return res.send({ responseCode: 200, success: false, responseMessage: "field" })
        }

        if (password.length < 6) {
            let encryptError = helper({ responseCode: 200, success: false, responseMessage: 'Password must be a maximum of 6 digits' })
            const decryptedData = helperDecypt(encryptError);
            console.log(decryptedData);

            return res.send({ encryptedData: encryptError })
            // return res.send({ responseCode: 200, success: false, responseMessage: 'Password must be a maximum of 6 digits' });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let encryptError = helper({ responseCode: 200, success: false, responseMessage: "Invalid email" })
            const decryptedData = helperDecypt(encryptError);
            console.log(decryptedData);

            return res.send({ encryptedData: encryptError })

            // return res.send({ responseCode: 200, success: false, responseMessage: "email invelid" })

        }

        const findEmail = await userModel.findOne({ email: email });
        if (findEmail) {
            let encryptError = helper({ responseCode: 200, success: false, responseMessage: "This email already exits!" })
            const decryptedData = helperDecypt(encryptError);
            console.log(decryptedData);

            return res.send({ encryptedData: encryptError })
            // return res.send({ responseCode: 200, success: false, responseMessage: "This email already exits!" })
        }

        const token = uuid.v4();
        const registration = await userModel.create({
            name: name,
            email: email,
            code: token,
            phoneNumber: phoneNumber,
            coin: 0,
            password: password,
            // image: `${req.file.filename}`
        })

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPass,
            },
        });

        const mailOptions = {
            from: config.emailUser, // Sender's email address
            to: email,
            subject: 'Email Verification',
            text: `Click the following link to verify your email: http://45.79.126.10:3025/user/verify/email/?id=${token}`,
            // You can also use HTML for the email body:
            // html: '<h1>Hello, Nodemailer!</h1><p>This is an HTML email.</p>'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        let encrypted = helper({ responseCode: 200, success: true, responseMessage: "User registared successfully.Please check your email.", responseResult: registration._doc })
        const decryptedData = helperDecypt(encrypted);
        console.log(decryptedData);

        return res.send({ encryptedData: encrypted })

        // return res.send({ responseCode: 200, success: false, responseMessage: registration })


    }
    catch (error) {
        let encrypted = helper({ responseCode: 400, success: false, responseMessage: error.message })
        const decryptedData = helperDecypt(encrypted);
        console.log(decryptedData);

        return res.send({ encryptedData: encrypted })
        // return res.send({ responseCode: 400, success: false, responseMessage: error.message })
    }
}

exports.verifyEmail = async (req, res) => {
    try {

        const verficationCode = req.query.id;
        const findUser = await userModel.findOne({ code: verficationCode });
        if (!findUser) {
            return res.send({ responseCode: 200, success: false, responseMessage: "This verfication link does not exist !" })
            // return res.send({ encryptedData: encryptError });
        }

        const updateUser = await userModel.findOneAndUpdate({ _id: findUser._id },
            {
                $set: {
                    code: "",
                    isVerify: true
                }
            },
            { new: true });
        return res.send({ responseCode: 200, success: true, responseMessage: "user verify !" })
        // return res.send({ encryptedData: encrypted })
    }

    catch (error) {
        let encrypted = helper({ responseCode: 400, success: false, responseMessage: error.message })
        return res.send({ encryptedData: encrypted })
    }
}

exports.login = async (req, res) => {
    try {

        const reqBody = req.body
        const { email, password } = reqBody
        if (!password || !email) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "All fields are required" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "Invalid email" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

        const userData = await userModel.findOne({ email: email })
        if (!userData) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "Email not exits" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

        if (!userData.isVerify) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "Email is not verified" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

        if (userData.password != password) {
            let encrypted = helper({ reponseCode: 200, success: false, responseMessage: 'Incorrect password.' })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }
        else {
            const accessToken = jwt.sign(
                {
                    success: true,
                    message: "User detail !",
                    user: {
                        email: userData.email,
                        password: userData.password,
                        _id: userData._id,
                    },
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "1d" }
            );

            let encrypted = helper({ responseCode: 200, success: true, responseMessage: "Login successfully", responseResult: userData._doc })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted, token: accessToken })
        }
    }
    catch (error) {
        let encrypted = helper({ responseCode: 400, success: false, responseMessage: error.message })
        const decryptedData = helperDecypt(encrypted);

        return res.send({ encryptedData: encrypted })
    }
}

exports.userProfile = async (req, res) => {
    try {
        const user = req.user;
        const id = user._id;

        const reqBody = req.body
        const { name, phoneNumber } = reqBody

        const findUser = await userModel.findOne({ _id: id })
        if (!findUser) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "You are not a user!" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

        if (req.file) {
            const userProfileData = await userModel.findOneAndUpdate(
                { _id: id },
                {
                    $set: {
                        user_id: id,
                        image: `${req.file.filename}`,
                        name: name,
                        phoneNumber: phoneNumber

                    }
                },
                { new: true }

            )
            const accessToken = jwt.sign(
                {
                    success: true,
                    message: "User detail !",
                    user: {
                        email: userProfileData.email,
                        _id: userProfileData._id,
                        phoneNumber: userProfileData.phoneNumber,
                        name: userProfileData.name,
                    },
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "1d" }
            );

            let encrypted = helper({ responseCode: 200, success: true, responseMessage: "User profile update successffully", responseResult: userProfileData._doc })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })

            // return res.send({ responseCode: 200, success: true, responseMessage: "User profile update successffully", responseResult: userProfileData, token: accessToken })
        }
        else {
            const userProfileData = await userModel.findOneAndUpdate(
                { _id: id },
                {
                    $set: {
                        user_id: id,
                        name: name,
                        phoneNumber: phoneNumber
                    }
                },
                { new: true }

            )
            const accessToken = jwt.sign(
                {
                    success: true,
                    message: "User detail !",
                    user: {
                        email: userProfileData.email,
                        _id: userProfileData._id,
                        phoneNumber: userProfileData.phoneNumber,
                        name: userProfileData.name,
                    },
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "1d" }
            );

            let encrypted = helper({ responseCode: 200, success: true, responseMessage: "User profile update successffully", responseResult: userProfileData._doc })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })

            // return res.send({ responseCode: 200, success: true, responseMessage: "User profile update successffully", responseResult: userProfileData, token: accessToken })
        }
    }
    catch (error) {
        let encrypted = helper({ responseCode: 400, success: false, responseMessage: error.message })
        const decryptedData = helperDecypt(encrypted);

        return res.send({ encryptedData: encrypted })
    }
}

// exports.savePlayerData = async (req, res) => {
//     try {
//         const user = req.user;
//         const id = user._id;

//         const findUser = await userModel.findOne({ _id: id })
//         if (!findUser)
//             return res.send({ responseCode: 200, success: false, responseMessage: "You are not a user!" })

//         const reqBody = req.body
//         const { roomId, isPrivate, isPublic } = reqBody

//         if (!roomId)
//             return res.send({ responseCode: 200, success: false, responseMessage: "Fields are required" })

//         // const min = 100000; // Smallest 6-digit number (100000)
//         // const max = 999999; // Largest 6-digit number (999999)
//         // const randomSixDigitNumber = Math.floor(Math.random() * (max - min + 1)) + min;

//         const playerData = await gameModel.create({
//             roomId: roomId,
//             createrId: id,
//             isPrivate: isPrivate,
//             isPublic: isPublic,
//         })
//         var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(playerData), 'secret key 123').toString();

//         return res.send({ responseCode: 200, success: true, responseMessage: "Player info save successfully", responseResult: playerData })

//     }
//     catch (error) {
//         return res.send({ responseCode: 400, responseMessage: "Something went wrong", responseResult: error.message })
//     }
// }


// exports.tableBetCharge = async (req, res) => {
//     try {
//         const user = req.user;
//         const id = user._id;
//         const findUser = await userModel.findOne({ _id: id })
//         if (!findUser)
//             return res.send({ responseCode: 200, success: false, responseMessage: "You are not a user!" })

//         const reqBody = req.body
//         const { roomId, isTable, charge, userWallet, amount } = reqBody

//         if (!roomId || !isTable || !charge || !userWallet || !amount)
//             return res.send({ responseCode: 200, success: false, responseMessage: "All fields are required" })

//         if (isTable == "true") {
//             const tableCharge = await ledgerModel.create({
//                 roomId: roomId,
//                 userId: id,
//                 isTable: isTable,
//                 charge: charge,
//                 userWallet: userWallet,
//                 amount: amount
//             })
//             var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(tableCharge), 'secret key 123').toString();

//             return res.send({ responseCode: 200, success: true, responseMessage: "Table charge given successfully", responseResult: ciphertext })
//         }

//         else if (isTable == "false") {
//             const betCharge = await ledgerModel.create({
//                 roomId: roomId,
//                 userId: id,
//                 isTable: isTable,
//                 charge: charge,
//                 userWallet: userWallet,
//                 amount: amount
//             })
//             var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(betCharge), 'secret key 123').toString();

//             return res.send({ responseCode: 200, success: true, responseMessage: "Bet charge given successfully", responseResult: ciphertext })
//         }
//     }
//     catch (error) {
//         return res.send({ responseCode: 400, responseMessage: "Something went wrong", responseResult: error.message })
//     }
// }

exports.requestMoney = async (req, res) => {
    try {
        const user = req.user;
        const id = user._id;
        const findUser = await userModel.findOne({ _id: id })
        if (!findUser) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "You are not a user!" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }
        const reqBody = req.body
        const { amount, type } = reqBody

        if (!amount || !type) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "Amount is required" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

        if (findUser.coin > 0) {
            let userCoin = findUser.coin - amount
            const userRequest = await moneyRequestModel.create({
                userId: id,
                amount: amount
            })

            const requestData = await ledgerModel.create({
                userId: id,
                amount: amount,
                wallet: userCoin,
                type: type,
                reason: "Redeem",
                // previousDataId:previousDataId
            })

            const deductCoin = await userModel.findOneAndUpdate({ _id: id },
                {
                    $set: {
                        coin: userCoin
                    }
                },
                { new: true }
            )
            let encrypted = helper({ responseCode: 200, success: true, responseMessage: "Send money for request successfully", responseResult: deductCoin._doc })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }
        else {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: 'You have 0 rupees in your wallet. Refill your wallet.' })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }
    }
    catch (error) {
        let encrypted = helper({ responseCode: 400, success: false, responseMessage: error.message })
        const decryptedData = helperDecypt(encrypted);

        return res.send({ encryptedData: encrypted })
    }
}

exports.playerJoin = async (req, res) => {
    try {
        const user = req.user;
        const id = user._id;
        const findUser = await userModel.findOne({ _id: id })

        if (!findUser) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "You are not a user!" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

        const reqBody = req.body
        const { userId, gameId } = reqBody

        if (!userId || !gameId) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "All fields are required" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

        const findPlayerLength = await gameModel.findOne({ gameId: gameId })
        const findUserWallet = await userModel.findOne({ _id: userId })

        if (findUserWallet.coin > 0) {
            if (!findUserWallet.isVerify) {
                let encrypted = helper({ responseCode: 200, success: false, responseMessage: "Email is not verified. First you have to verify your email then you can join" })
                const decryptedData = helperDecypt(encrypted);

                return res.send({ encryptedData: encrypted })
            }

            if (findPlayerLength.createrId == userId) {
                let encrypted = helper({ responseCode: 200, success: false, responseMessage: "You can not join you are a creater" })
                const decryptedData = helperDecypt(encrypted);

                return res.send({ encryptedData: encrypted })
            }

            const isPresent = findPlayerLength.playerJoin.find(person => person.userId == userId);
            if (isPresent) {
                let encrypted = helper({ responseCode: 200, success: false, responseMessage: "Player has been already join" })
                const decryptedData = helperDecypt(encrypted);

                return res.send({ encryptedData: encrypted })
            }

            if (findPlayerLength.playerJoin.length == Number(6)) {
                let encrypted = helper({ responseCode: 200, success: false, responseMessage: "You can not join more then six in this room" })
                const decryptedData = helperDecypt(encrypted);

                return res.send({ encryptedData: encrypted })
            }

            let tabaChargeData = findUserWallet.coin - findPlayerLength.tablePrice

            const playerData = await gameModel.findOneAndUpdate(
                { gameId: gameId },
                {
                    $push: {
                        playerJoin: {
                            userId
                        },
                    }
                },
                { new: true }
            )

            const tableChargeSaveLedger = await ledgerModel.create({
                gameId: gameId,
                userId: userId,
                amount: findPlayerLength.tablePrice,
                wallet: tabaChargeData,
                reason: "TableCharge",
                // previousDataId:previousDataId
            })

            let encrypted = helper({ responseCode: 200, success: true, responseMessage: "Player join and table charge cut successfully", responseResult: playerData._doc })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })

            // return res.send({ responseCode: 200, success: true, responseMessage: "Player join and table charge cut successfully", responseResult: playerData })
        }
        else {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: 'You have 0 rupees in your wallet. Refill your wallet to join the game.' })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted });
        }
    }
    catch (error) {
        let encrypted = helper({ responseCode: 400, success: false, responseMessage: error.message })
        const decryptedData = helperDecypt(encrypted);

        return res.send({ encryptedData: encrypted })
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const reqBody = req.body
        const { email } = reqBody
        if (!email) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "Email is required !" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "Invalid email" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

        const verificationtoken = uuidv4();
        let findUserEmail = await userModel.findOne({ email: email });

        if (!findUserEmail) {
            let encrypted = helper({ reponseCode: 200, success: false, responseMessage: 'Email does not exist !.' })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted });
        }

        else {
            const updateResetCode = await userModel.findOneAndUpdate({ email: email },
                {
                    $set: {
                        code: verificationtoken
                    }
                }, { new: true })

            var verificationURL = `http://localhost:3004/user/reset/password?id=${verificationtoken}`;
            // let transporter = nodemailer.createTransport({
            //     service: 'gmail',
            //     host: 'smtp.gmail.com',
            //     port: 465,
            //     secure: false,
            //     requireTLS: true,
            //     auth: {
            //         user: config.emailUser,
            //         pass: config.emailPass,
            //     },
            // });

            // const mailOptions = {
            //     from: config.emailUser,
            //     to: email,
            //     subject: "Reset you password",
            //     template: 'resettingYourPassword',
            //     context: {
            //         verificationURL: verificationURL,
            //         userEmail: email
            //     },
            // };

            // transporter.sendMail(mailOptions, (error, info) => {
            //     if (error) {
            //         console.error('Error sending email:', error);
            //     } else {
            //         console.log('Email sent:', info.response);
            //     }
            // });

            let userEmail = await transporter.sendMail({
                from: config.emailUser,
                to: email,
                subject: "Reset you password",
                template: 'resettingYourPassword',
                context: {
                    verificationURL: verificationURL,
                    userEmail: email
                },
            });

            let encrypted = helper({ responseCode: 200, success: true, responseMessage: "Forgot password link send successfully on your mail.", responseResult: email._doc })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
            // return res.send({ responseCode: 200, success: true, responseMessage: "Forgot password link send successfully" })
        }
    }
    catch (error) {
        let encrypted = helper({ responseCode: 400, success: false, responseMessage: error.message })
        const decryptedData = helperDecypt(encrypted);

        return res.send({ encryptedData: encrypted })
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const code = req.query.id;
        const findUser = await userModel.findOne({ code: code });
        if (findUser) {
            res.render('resetPassword');
        }
        else {
            res.send({ responseCode: 200, success: false, responseResult: "This link does not exist !" })
        }
    }
    catch (error) {
        let encrypted = helper({ responseCode: 400, success: false, responseMessage: error.message })
        return res.send({ encryptedData: encrypted })
    }
}

exports.addCoins = async (req, res) => {
    try {
        const reqBody = req.body
        const { coin, email, phoneNumber, user_id, addCoin } = reqBody
        if (!coin || !addCoin) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "All fields are required" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

        const findEmail = await userModel.findOne({ email: email })
        const findPhoneNumber = await userModel.findOne({ phoneNumber: phoneNumber })
        const findUserId = await userModel.findOne({ user_id: user_id })

        if (addCoin == "true") {
            if (findEmail) {
                let addEmail = findEmail.coin + coin

                const addCoineByEmail = await userModel.findOneAndUpdate(
                    { email: email },
                    {
                        $set: {
                            coin: addEmail
                        }
                    },
                    { new: true }
                )

                let encrypted = helper({ responseCode: 200, success: true, responseMessage: "Coin added by email successfully", responseResult: addCoineByEmail._doc })
                const decryptedData = helperDecypt(encrypted);

                return res.send({ encryptedData: encrypted })

                // return res.send({ responseCode: 200, success: true, responseMessage: "Coin added by email successfully", responseResult: addCoineByEmail })
            }

            else if (findPhoneNumber) {
                let addPhoneNumber = findPhoneNumber.coin + coin
                const addCoineByPhoneNumber = await userModel.findOneAndUpdate(
                    { phoneNumber: phoneNumber },
                    {
                        $set: {
                            coin: addPhoneNumber
                        }
                    },
                    { new: true }
                )

                let encrypted = helper({ responseCode: 200, success: true, responseMessage: "Coin added by phone number successfully", responseResult: addCoineByPhoneNumber._doc })
                const decryptedData = helperDecypt(encrypted);

                return res.send({ encryptedData: encrypted })

                // return res.send({ responseCode: 200, success: true, responseMessage: "Coin added by phone number successfully", responseResult: addCoineByPhoneNumber })
            }

            else if (findUserId) {
                let addUserId = findUserId.coin + coin

                const addCoineByUserId = await userModel.findOneAndUpdate(
                    { user_id: user_id },
                    {
                        $set: {
                            coin: addUserId
                        }
                    },
                    { new: true }
                )
                let encrypted = helper({ responseCode: 200, success: true, responseMessage: "Coin added by userid successfully", responseResult: addCoineByUserId._doc })
                const decryptedData = helperDecypt(encrypted);

                return res.send({ encryptedData: encrypted })

                // return res.send({ responseCode: 200, success: true, responseMessage: "Coin added by userid successfully", responseResult: addCoineByUserId })
            }

            else {
                let encrypted = helper({ responseCode: 200, success: false, responseMessage: "Not found" })
                const decryptedData = helperDecypt(encrypted);

                return res.send({ encryptedData: encrypted })
            }
        }
        else if (addCoin == "false") {
            if (findEmail) {
                let addEmail = findEmail.coin - coin

                const addCoineByEmail = await userModel.findOneAndUpdate(
                    { email: email },
                    {
                        $set: {
                            coin: addEmail
                        }
                    },
                    { new: true }
                )

                let encrypted = helper({ responseCode: 200, success: true, responseMessage: "Coin deduct by email successfully", responseResult: addCoineByEmail._doc })
                const decryptedData = helperDecypt(encrypted);

                return res.send({ encryptedData: encrypted })

                // return res.send({ responseCode: 200, success: true, responseMessage: "Coin deduct by email successfully", responseResult: addCoineByEmail })
            }

            else if (findPhoneNumber) {
                let addPhoneNumber = findPhoneNumber.coin - coin
                const addCoineByPhoneNumber = await userModel.findOneAndUpdate(
                    { phoneNumber: phoneNumber },
                    {
                        $set: {
                            coin: addPhoneNumber
                        }
                    },
                    { new: true }
                )

                let encrypted = helper({ responseCode: 200, success: true, responseMessage: "Coin deduct by phone number successfully", responseResult: addCoineByPhoneNumber._doc })
                const decryptedData = helperDecypt(encrypted);

                return res.send({ encryptedData: encrypted })

                // return res.send({ responseCode: 200, success: true, responseMessage: "Coin deduct by phone number successfully", responseResult: addCoineByPhoneNumber })
            }

            else if (findUserId) {
                let addUserId = findUserId.coin - coin

                const addCoineByUserId = await userModel.findOneAndUpdate(
                    { user_id: user_id },
                    {
                        $set: {
                            coin: addUserId
                        }
                    },
                    { new: true }
                )
                let encrypted = helper({ responseCode: 200, success: true, responseMessage: "Coin deduct by userid successfully", responseResult: addCoineByUserId._doc })
                const decryptedData = helperDecypt(encrypted);

                return res.send({ encryptedData: encrypted })

                // return res.send({ responseCode: 200, success: true, responseMessage: "Coin deduct by userid successfully", responseResult: addCoineByUserId })
            }
            else {
                let encrypted = helper({ responseCode: 200, success: false, responseMessage: "Not found" })
                const decryptedData = helperDecypt(encrypted);

                return res.send({ encryptedData: encrypted })
            }
        }
        else {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "Please select right option" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

    }
    catch (error) {
        let encrypted = helper({ responseCode: 400, success: false, responseMessage: error.message })
        const decryptedData = helperDecypt(encrypted);

        return res.send({ encryptedData: encrypted })
    }
}


exports.createGame = async (req, res) => {
    try {
        const user = req.user;
        const id = user._id;
        const findUser = await userModel.findOne({ _id: id })
        if (!findUser) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "You are not a user!" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

        const reqBody = req.body
        const { gameId, createrId } = reqBody
        // if (!gameId || !createrId)
        //     return res.send({ responseCode: 200, success: false, responseMessage: "All fields are required" })

        const min = 100000; // Smallest 6-digit number (100000)
        const max = 999999; // Largest 6-digit number (999999)
        const randomSixDigitNumber = Math.floor(Math.random() * (max - min + 1)) + min;

        const findTableCharge = await tableModel.findOne({})

        const gameData = await gamePlayModel.create({
            gameId: randomSixDigitNumber,
            createrId: id,
            tablePrice: findTableCharge.tableCharge
        })

        let encrypted = helper({ responseCode: 200, success: true, responseMessage: "Game created successfully", responseResult: gameData._doc })
        const decryptedData = helperDecypt(encrypted);

        return res.send({ encryptedData: encrypted })

        // return res.send({ responseCode: 200, success: true, responseMessage: "Game created successfully", responseResult: gameData })
    }
    catch (error) {
        let encrypted = helper({ responseCode: 400, success: false, responseMessage: error.message })
        const decryptedData = helperDecypt(encrypted);

        return res.send({ encryptedData: encrypted })
    }
}


exports.useBet = async (req, res) => {
    try {
        const user = req.user;
        const id = user._id;
        const findUser = await userModel.findOne({ _id: id })

        if (!findUser) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "You are not a user!" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

        const reqBody = req.body
        const { userId, price, gameId, type } = reqBody
        if (!userId || !price || !gameId || !type) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "All fields are required" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

        const findPlayerLength = await gameModel.findOne({ gameId: gameId })
        const findUserWallet = await userModel.findOne({ _id: userId })

        if (!findUserWallet.isVerify) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "Email is not verified. First you have to verify your email then you can use bet" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

        let betAmount = findUserWallet.coin - price
        if (findUserWallet.coin > 0) {
            const playerData = await gameModel.findOneAndUpdate(
                { gameId: gameId },
                {
                    $push: {
                        bet: {
                            userId,
                            price
                        },
                    }
                },
                { new: true }
            )

            const tableChargeSaveLedger = await ledgerModel.create({
                gameId: gameId,
                userId: userId,
                amount: price,
                wallet: betAmount,
                type: type,
                reason: "betCharge",
                // previousDataId:previousDataId
            })

            const updateCoin = await userModel.findOneAndUpdate(
                { _id: userId },
                {
                    $set: {
                        coin: betAmount
                    }
                },
                { new: true }
            )

            let encrypted = helper({ responseCode: 200, success: true, responseMessage: "Bet use successfully", responseResult: playerData._doc })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })

            // return res.send({ responseCode: 200, success: true, responseMessage: "Bet use successfully", responseResult: playerData })
        }
        else {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: 'You have 0 rupees in your wallet. Refill your wallet to use bet in  game.' });
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

    }
    catch (error) {
        let encrypted = helper({ responseCode: 400, success: false, responseMessage: error.message })
        const decryptedData = helperDecypt(encrypted);

        return res.send({ encryptedData: encrypted })
    }
}

exports.savePlayerCard = async (req, res) => {
    try {
        const user = req.user;
        const id = user._id;
        const findUser = await userModel.findOne({ _id: id })

        if (!findUser) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "You are not a user!" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

        const reqBody = req.body
        const { userId, card, gameId } = reqBody
        if (!userId || !card || !gameId) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "All fields are required" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

        if (!findUser.isVerify) {
            let encrypted = helper({ responseCode: 200, success: false, responseMessage: "Email is not verified. First you have to verify your email then you can get card" })
            const decryptedData = helperDecypt(encrypted);

            return res.send({ encryptedData: encrypted })
        }

        const playerData = await gameModel.findOneAndUpdate(
            { gameId: gameId },
            {
                $push: {
                    playerCard: {
                        userId,
                        card
                    },
                }
            },
            { new: true }
        )

        let encrypted = helper({ responseCode: 200, success: true, responseMessage: "Player card get successfully", responseResult: playerData._doc })
        const decryptedData = helperDecypt(encrypted);

        return res.send({ encryptedData: encrypted })

        // return res.send({ responseCode: 200, success: false, responseMessage: "Player card get successfully", responseResult: playerData })
    }
    catch (error) {
        let encrypted = helper({ responseCode: 400, success: false, responseMessage: error.message })
        const decryptedData = helperDecypt(encrypted);

        return res.send({ encryptedData: encrypted })
    }
}


// exports.ledgerHistory = async (req, res) => {
//     try {

//     }
//     catch (error) {
//         return res.send({ responseCode: 400, success: false, responseResult: error.message })
//     }
// }