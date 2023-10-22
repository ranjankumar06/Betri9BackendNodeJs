const express = require("express");
var bodyParser = require("body-parser");
const serve = require('express-static');
const userRouter = require("./routes/userRouter")
const adminRouter = require("./routes/adminRouter")
const path = require("path")

const cors = require("cors");
require('dotenv').config()
const app = express();
require("./config/configdb");

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static("public"))

app.use("/user", userRouter);
app.use("/admin", adminRouter)

app.get("/", (req, res) => {
    res.send("Welcome");
});

app.use('/file/path', serve(path.join(__dirname, '../uploads')))

app.listen(3020, (err) => {
    if (err) console.log(err);
    else console.log("server running on 3020");
});
