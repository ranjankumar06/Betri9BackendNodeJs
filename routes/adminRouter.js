const express = require("express");
const bodyParser = require("body-parser");
const adminController = require("../controller/adminController")
const auth = require("../middleware/auth")
const { body } = require('express-validator');

const router = express.Router();

router.post("/login", adminController.adminLogin)

router.post("/actionOnRequest", auth, adminController.updateMoneyRequest)

router.get("/userList", auth, adminController.userList)

router.get("/transaction/history", auth, adminController.transactionHistory)

router.post("/specific/user", auth, adminController.specificUser)

// create and update
router.post("/tableCharge", auth, adminController.addTableCharge)

router.get("/getTableCharge", auth, adminController.getTbaleCharge)

module.exports = router;
