const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playerSchema = new mongoose.Schema(
    {
        gameId: {
            type: String
        },
        createrId: {
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        tablePrice: {
            type: Number,
            default: 0
        },
        bet: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: "user"
            },
            winner: {
                type: Number,
                default:0
            },
            price: {
                type: Number,
                default:0
            }
        }],

        playerCard: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: "user"
            },
            card: [{
                type: Number
            }]
        }],

        winner: [{

            userId: {
                type: Schema.Types.ObjectId,
                ref: "user"
            },
            price: {
                type: Number,
                default: 0
            },
            winner: {
                type: Number,
                default: 0
            }
        }],

        houseCut: {
            type: Number
        },
        isCompleted: {
            type: String,
            enum: ["Finished", "Active"],
            default: "Active"
        },

        isActive: {
            type: Boolean,
            default: false
        },

        playerJoin: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: "user"
            },
        }]
    },
    { timestamps: true }
);
module.exports = mongoose.model("gameTable", playerSchema);