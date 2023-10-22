const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const requestSchema = new mongoose.Schema(
    {

        userId: {
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        status: {
            type: String,
            enum: ["Pending", "Rejected","Success"],
            default: 'Pending'
        },
        amount: {
            type: Number
        },
    },
    { timestamps: true }
);
module.exports = mongoose.model("moneyRequest", requestSchema);