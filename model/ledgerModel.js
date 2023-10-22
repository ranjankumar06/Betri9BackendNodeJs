const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ledgerSchema = new mongoose.Schema(
    {
        gameId: {
            type: String
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        previousDataId: {
            type: String
        },
        wallet: {
            type: Number
        },
        amount:{
            type:Number
        },
        type:{
            type:String,
            enum:["Debit","Credit"]
        },
        reason: {
            type: String,
            enum: ["betCharge","tableCharge","Refund","Redeem"]
        },
    },
    { timestamps: true }
);
module.exports = mongoose.model("ledger", ledgerSchema);