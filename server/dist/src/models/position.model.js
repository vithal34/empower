"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionSchema = void 0;
const mongoose_1 = require("mongoose");
exports.PositionSchema = new mongoose_1.Schema({
    symbol: {
        type: String,
        required: true,
        uppercase: true,
        trim: true, // Remove any potential whitespace
    },
    purchasePrice: {
        type: Number,
        required: true,
        min: 0, // The price should not be negative
    },
    purchaseDate: {
        type: Number,
        default: Date.now, // Default to current date/time
    },
    quantity: {
        type: Number,
        required: true,
        min: 1, // Minimum of 1 share
    },
});
// 3. Create a Model.
const Position = (0, mongoose_1.model)("Position", exports.PositionSchema);
exports.default = Position;
