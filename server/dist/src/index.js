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
const morgan = require("morgan"); //import morgan
const { log } = require("mercedlogger"); // import mercedlogger's log function
const cors = require("cors");
const rateLimit = require("express-rate-limit").rateLimit;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
// Config/initialization
const app = (0, express_1.default)();
// yahooFinance.setGlobalConfig({ validation: { logErrors: false } });
dotenv_1.default.config();
const PORT = process.env.PORT || 3010;
// Docs
const { swaggerDocs } = require("./utils/swagger");
// Database
const Database = require("./utils/db");
const UserSchema = require("./models/user.model");
// Middleware
app.use(cors());
app.use(morgan("tiny"));
app.use(express_1.default.json());
// Ratelimiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 250,
    standardHeaders: true,
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const loginLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 15,
    message: "Too many login attempts from this IP, please try again after an hour",
    standardHeaders: true,
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many accounts created from this IP, please try again after an hour",
    standardHeaders: true,
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use("/api/", apiLimiter);
// app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/signup", createAccountLimiter);
// REST Routes
app.use(require("./routes"));
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Example app listening at http://0.0.0.0:${PORT}`);
    swaggerDocs(app, PORT);
}));
