"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionSchema = void 0;
const mongoose_1 = require("mongoose");
exports.TransactionSchema = new mongoose_1.Schema({
    symbol: {
        type: String,
        required: true,
        uppercase: true,
        trim: true, // Remove any potential whitespace
    },
    price: {
        type: Number,
        required: true,
        min: 0, // The price should not be negative
    },
    quantity: {
        type: Number,
        required: true,
        min: 1, // Minimum of 1 share
    },
    type: {
        type: String,
        required: true,
        enum: ["buy", "sell"],
    },
    date: {
        type: Number,
        default: Date.now, // Default to current date/time
    },
});
const Transaction = (0, mongoose_1.model)("Transaction", exports.TransactionSchema);
exports.default = Transaction;
