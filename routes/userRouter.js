const express = require("express");
const bodyParser = require("body-parser");
const userController = require("../controller/userController")
const auth = require("../middleware/auth")
const { body } = require('express-validator');

const multer = require('multer');
const router = express.Router();

const path = require("path")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../uploads'); // Set the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);
        const fileName = Date.now() + extension;
        cb(null, fileName); // Save the file with a unique name and original file extension
    }
});
const upload = multer({ storage: storage })

// Registration
router.post("/registration", [body('email').isEmail().withMessage('Invalid email')], userController.registration)

// Email verify
router.get("/verify/email", userController.verifyEmail);

// login
router.post("/login", userController.login)

// userProfile
router.post("/userProfile", auth, upload.single("image"), userController.userProfile);

// forgotPassword
router.post("/forgot/password", [body('email').isEmail().withMessage('Invalid email')], userController.forgotPassword)
router.get("/reset/password", userController.resetPassword)

// Save player data
// router.post("/playerGamePlay", auth, userController.savePlayerData)

// Table or bet charge  
// router.post("/tableBetCharge", auth, userController.tableBetCharge)

// Request for money
router.post("/requestMoney", auth, userController.requestMoney)

router.post("/join", auth, userController.playerJoin)

// Add coin
router.post("/addCoin", userController.addCoins)

router.post("/create/game", auth, userController.createGame)

router.post("/bet", auth, userController.useBet)

router.post("/save/card",auth,userController.savePlayerCard)


module.exports = router;
