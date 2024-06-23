"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const middleware_1 = require("./middleware");
const auth_controller_1 = __importDefault(require("./controller/auth.controller"));
const user_controller_1 = __importDefault(require("./controller/user.controller"));
const stocks_controller_1 = __importDefault(require("./controller/stocks.controller"));
const news_controller_1 = __importDefault(require("./controller/news.controller"));
const leaderboard_controller_1 = __importDefault(require("./controller/leaderboard.controller"));
// Auth routes
router.post("/api/auth/signup", [middleware_1.verifySignUp.checkDuplicateUsername], auth_controller_1.default.signup);
router.post("/api/auth/login", auth_controller_1.default.login);
// User data routes
router.get("/api/user/ledger", [middleware_1.authJwt.verifyToken], user_controller_1.default.getLedger);
router.get("/api/user/holdings", [middleware_1.authJwt.verifyToken], user_controller_1.default.getHoldings);
router.get("/api/user/portfolio", [middleware_1.authJwt.verifyToken], user_controller_1.default.getPortfolio);
router.get("/api/user/leaderboard", leaderboard_controller_1.default.getLeaderboard);
// User watchlist routes
router.get("/api/user/watchlist", [middleware_1.authJwt.verifyToken], user_controller_1.default.getWatchlist);
router.post("/api/user/watchlist/add/:symbol", [middleware_1.authJwt.verifyToken], user_controller_1.default.addToWatchlist);
router.post("/api/user/watchlist/remove/:symbol", [middleware_1.authJwt.verifyToken], user_controller_1.default.removeFromWatchlist);
// Stocks routes
router.get("/api/stocks/search/:query", stocks_controller_1.default.search);
router.get("/api/stocks/:symbol/info", stocks_controller_1.default.getInfo);
router.get("/api/stocks/:symbol/historical", stocks_controller_1.default.getHistorical);
router.post("/api/stocks/:symbol/buy", [middleware_1.authJwt.verifyToken], stocks_controller_1.default.buyStock);
router.post("/api/stocks/:symbol/sell", [middleware_1.authJwt.verifyToken], stocks_controller_1.default.sellStock);
// News routes
router.get("/api/news", news_controller_1.default.getNews);
router.get("/api/news/:symbol", news_controller_1.default.getNews);
module.exports = router;
