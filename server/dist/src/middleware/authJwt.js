"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jwtSecret = process.env.STOTRA_JWT_SECRET;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function verifyToken(req, res, next) {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    #swagger.autoHeaders=false
    */
    let token = req.headers["authorization"];
    if (!token) {
        return res.status(403).send({ message: "No token provided" });
    }
    token = token.split(" ")[1];
    jsonwebtoken_1.default.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Unauthorized: " + err.message || "",
            });
        }
        // Set request user id to decoded id in typescript
        req.body.userId = decoded.id;
        next();
    });
}
exports.verifyToken = verifyToken;
exports.default = { verifyToken };
