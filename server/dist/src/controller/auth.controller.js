"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jwtSecret = process.env.STOTRA_JWT_SECRET;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("../models/user.model"));
const axios_1 = __importDefault(require("axios"));
const signup = (req, res) => {
    /*
    #swagger.tags = ['Authentication']
    */
    if (!req.body.username || !req.body.password) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    validateTurnstile(req.body["cf-turnstile-response"])
        .then((_) => {
        const newUser = new user_model_1.default({
            username: req.body.username,
            password: bcryptjs_1.default.hashSync(req.body.password, 8),
            watchlist: [],
            ledger: [],
            positions: [],
            cash: 100000,
        });
        newUser
            .save()
            .then((user) => {
            if (user) {
                user
                    .save()
                    .then(() => {
                    res.send({ message: "User was registered successfully!" });
                })
                    .catch((err) => {
                    res.status(500).send({ message: err.message });
                });
            }
        })
            .catch((err) => {
            res.status(500).send({ message: err });
        });
    })
        .catch((err) => {
        res.status(500).send({ message: err.message });
    });
};
const login = (req, res) => {
    /*
    #swagger.tags = ['Authentication']
    */
    validateTurnstile(req.body["cf-turnstile-response"])
        .then((_) => {
        user_model_1.default.findOne({
            username: req.body.username,
        })
            .then((user) => {
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }
            var passwordIsValid = bcryptjs_1.default.compareSync(req.body.password, user.password);
            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Incorret password",
                });
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id }, jwtSecret, {
                algorithm: "HS256",
                allowInsecureKeySizes: true,
                expiresIn: "7 days",
            });
            res.status(200).send({
                id: user._id,
                username: user.username,
                accessToken: token,
            });
        })
            .catch((err) => {
            res.status(500).send({ message: err.message });
        });
    })
        .catch((err) => {
        res.status(400).send({ message: err.message });
        return;
    });
};
const validateTurnstile = (token) => __awaiter(void 0, void 0, void 0, function* () {
    /*
    #swagger.tags = ['Authentication']
    */
    let secret = process.env.STOTRA_TURNSTILE_SECRET;
    if (!secret) {
        throw new Error("Turnstile secret not found");
    }
    let res = yield axios_1.default
        .post("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        secret: process.env.STOTRA_TURNSTILE_SECRET,
        response: token,
    })
        .catch((err) => {
        throw new Error(err);
    });
    if (res.data.success) {
        return true;
    }
    else {
        throw new Error("Can't validate turnstile token: " + res.data["error-codes"]);
    }
});
exports.default = { signup, login };
