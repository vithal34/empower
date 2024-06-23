"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const checkDuplicateUsername = (req, res, next) => {
    // Username
    user_model_1.default.findOne({
        username: req.body.username,
    })
        .then((user) => {
        if (user) {
            res.status(400).send({ message: "Username is already in use" });
            return;
        }
        next();
    })
        .catch((err) => {
        console.log("err", err);
        res.status(500).send({ message: err });
    });
};
const verifySignUp = {
    checkDuplicateUsername,
};
exports.default = verifySignUp;
