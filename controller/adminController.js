const userModel = require("../model/userModel")
const moneyRequestModel = require("../model/moneyRequestModel")
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const tableModel = require("../model/tableModel");
const ledgerModel = require("../model/ledgerModel");

exports.updateMoneyRequest = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const findUser = await userModel.findOne({ _id: id })
    if (!findUser)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })

    const reqBody = req.body
    const { requestId, status, type } = reqBody
    if (!requestId || !status || !type )
      return res.send({ responseCode: 200, success: false, responseMessage: "All fields are required" })

    if (!findUser.isVerify)
      return res.send({ responseCode: 200, success: false, responseMessage: "Email is not verified" })

    const findRejectedUser = await moneyRequestModel.findOne({ _id: requestId })
    if (findRejectedUser.status == "Rejected")
      return res.send({ responseCode: 200, success: false, responseMessage: "Your request is rejected" })

    if (findRejectedUser.status == "Success")
      return res.send({ responseCode: 200, success: false, responseMessage: "You have already credit money" })

    const requestData = await moneyRequestModel.findOneAndUpdate({ _id: requestId },
      {
        $set: {
          status: status
        }
      },
      { new: true }
    )

    const totalCoin = await userModel.findOne({ _id: requestData.userId })
    let totalAmount = totalCoin.coin + requestData.amount

    const updateUserCoin = await userModel.findOneAndUpdate({ _id: requestData.userId },
      {
        $set: {
          coin: totalAmount
        }
      })

    const saveUserLedger = await ledgerModel.create({
      userId: id,
      amount: requestData.amount,
      // reason: reason,
      wallet: totalAmount,
      type: type,
      // previousDataId: previousDataId
    })
    return res.send({ responseCode: 200, success: true, responseMessage: "Request status update successfully", responseResult: updateUserCoin })

  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: "Something went wrong", responseResult: error.message })
  }
}

exports.adminLogin = async (req, res) => {
  try {
    const reqBody = req.body;
    const { email, password, role } = reqBody
    if (!email || !password)
      return res.send({ responseCode: 200, success: false, responseResult: "All feilds are required !" });

    if ((role == "admin") && (email == 'admin@gmail.com') && password == 'admin123') {
      let userData = await userModel.findOne({ email: email });
      if (!userData) {
        const admin = await userModel.create({
          password: bcrypt.hashSync(password),
          email: email,
          role: "admin",
          isVerify: true
        })
        const accessToken = jwt.sign(
          {
            success: true,
            message: "User detail !",
            user: {
              email: admin.email,
              password: admin.password,
              _id: admin._id,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1d" }
        );
        return res.send({ reponseCode: 200, success: true, responseMessage: 'Admin created  Successfully', responseResult: admin, token: accessToken },);
      }
      else {

        let passCheck = bcrypt.compareSync(password, userData.password);

        // console.log("adjfhjkasdhjkh", passCheck)

        if (passCheck == false) {
          return res.send({ reponseCode: 200, success: false, responseMessage: 'Incorrect password.' })
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

          return res.send({ responseCode: 200, success: true, responseMessage: "Admin login successfully", responseResult: userData, token: accessToken })
        }
      }
    }
    else {
      return res.send({ responseCode: 200, success: false, responseMessage: "Email or password is wrong !" })
    }
  } catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }

}

exports.userList = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const findUser = await userModel.findOne({ _id: id })
    if (!findUser)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })
    const userList = await userModel.find({})
    return res.send({ responseCode: 200, success: true, responseMessage: "user list get successfully", responseResult: userList })
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: "Something went wrong", responseMessage: error.message })
  }
}

exports.transactionHistory = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const findUser = await userModel.findOne({ _id: id })
    if (!findUser)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })
    const transactionData = await moneyRequestModel.find({})
    return res.send({ responseCode: 200, success: true, responseMessage: "Transaction history get successfully", responseResult: transactionData })
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: "Something went wrong", responseMessage: error.message })
  }
}

exports.specificUser = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const findUser = await userModel.findOne({ _id: id })
    if (!findUser)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })

    const reqBody = req.body
    const { userId } = reqBody
    if (!userId)
      return res.send({ responseCode: 200, success: false, responseMessage: "userId is required" })

    const specificUserData = await userModel.findOne({ _id: userId })

    return res.send({ responseCode: 200, success: true, responseMessage: "Specific user data get successfully", responseResult: specificUserData })

  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: "Something went wrong", responseMessage: error.message })
  }
}

exports.addTableCharge = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const findAdmin = await userModel.findOne({ _id: id })
    if (!findAdmin)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })

    const reqBody = req.body
    const { tableCharge, houseCut } = reqBody
    if (!tableCharge || !houseCut)
      return res.send({ responseCode: 200, success: false, responseMessage: "All fields are required" })

    const findTableId = await tableModel.findOne({});
    if (findTableId) {
      const tableData = await tableModel.findOneAndUpdate({ _id: findTableId._id },
        {
          $set: {
            tableCharge: tableCharge,
            houseCut: houseCut
          }
        },
        { new: true });
      return res.send({ responseCode: 200, success: true, responseMessage: "Table charge updated  successfully", responseResult: tableData })
    }
    else {
      const tableData = await tableModel.create({
        tableCharge: tableCharge,
        houseCut: houseCut
      })
      return res.send({ responseCode: 200, success: true, responseMessage: "Table charge created successfully", responseResult: tableData })
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: "Something went wrong", responseResult: error.message })
  }
}

exports.getTbaleCharge = async (req, res) => {
  try {
    const user = req.user
    const id = user._id
    const findAdmin = await userModel.findOne({ _id: id })
    if (!findAdmin)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })

    const findTableCharge = await tableModel.findOne({})
    return res.send({ responseCode: 200, success: true, responseMessage: "Table data get successfully", responseResult: findTableCharge })
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: "Something went wrong", responseResult: error.message })
  }
}