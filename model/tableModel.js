const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tableSchema = new mongoose.Schema(
    {
        tableCharge: {
            type: Number,
            default: 0
        },
        houseCut: {
            type: Number,
            default: 0
        },
    },
    { timestamps: true }
);
module.exports = mongoose.model("tableCharge", tableSchema);