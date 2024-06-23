"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const transaction_model_1 = require("./transaction.model");
const position_model_1 = require("./position.model");
// Create a Schema corresponding to the document interface.
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    watchlist: [String],
    ledger: [transaction_model_1.TransactionSchema],
    positions: [position_model_1.PositionSchema],
    cash: Number,
});
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
