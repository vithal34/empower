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
const user_model_1 = __importDefault(require("../models/user.model"));
const requests_1 = require("../utils/requests");
const getLedger = (req, res) => {
    /*
    #swagger.tags = ['User Data']
    */
    user_model_1.default.findById(req.body.userId)
        .then((user) => {
        res.status(200).json({ ledger: user.ledger });
    })
        .catch((err) => {
        res.status(500).send({ message: err.message });
    });
};
const getHoldings = (req, res) => {
    /*
    #swagger.tags = ['User Data']
    */
    user_model_1.default.findById(req.body.userId)
        .then((user) => {
        res.status(200).json({ positions: user.positions, cash: user.cash });
    })
        .catch((err) => {
        res.status(500).send({ message: err.message });
    });
};
const getPortfolio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /*
    #swagger.tags = ['User Data']
    */
    let user = yield user_model_1.default.findById(req.body.userId).lean();
    if (!user) {
        res.status(500).json({ message: "User not found" });
    }
    user = user;
    let portfolioValue = 0; //user.cash
    let portfolioPrevCloseValue = 0;
    // Create array of how many of each symbol (no duplicates)
    let positionsNoDupes = {};
    user.positions.forEach((position) => {
        if (positionsNoDupes[position.symbol]) {
            positionsNoDupes[position.symbol] += position.quantity;
        }
        else {
            positionsNoDupes[position.symbol] = position.quantity;
        }
    });
    const symbols = Object.keys(positionsNoDupes);
    const quantities = Object.values(positionsNoDupes);
    // Loop through each symbol and fetch current price
    Promise.all(symbols.map((symbol) => (0, requests_1.fetchStockData)(symbol)))
        .then((values) => {
        var listOfPositions = [];
        // Sum up the value of all positions
        values.map((value, i) => {
            // Sum up the value of all positions
            portfolioValue += value.regularMarketPrice * quantities[i];
            portfolioPrevCloseValue +=
                value.regularMarketPreviousClose * quantities[i];
        });
        // Create list of positions to send to frontend with data from user.positions plus the properties from the fetchStockData response
        user.positions.forEach((position) => {
            const positionLiveData = values.find((value) => value.symbol === position.symbol);
            if (positionLiveData) {
                listOfPositions.push(Object.assign(Object.assign({}, position), positionLiveData));
            }
        });
        res.status(200).json({
            portfolioValue,
            portfolioPrevCloseValue,
            positions: listOfPositions,
            cash: user.cash,
        });
    })
        .catch((err) => {
        res.status(500).send({ message: err.message });
    });
});
const getWatchlist = (req, res) => {
    /*
    #swagger.tags = ['User Watchlist']
    */
    user_model_1.default.findById(req.body.userId)
        .then((user) => {
        if (req.body.raw === "true") {
            res.status(200).json({ watchlist: user.watchlist });
        }
        else {
            // Get the current price of each stock in the watchlist
            Promise.all(user.watchlist.map((symbol) => (0, requests_1.fetchStockData)(symbol)))
                .then((values) => {
                res.status(200).json({ watchlist: values });
            })
                .catch((err) => {
                res.status(500).send({ message: err.message });
            });
        }
    })
        .catch((err) => {
        res.status(500).send({ message: err.message });
    });
};
const addToWatchlist = (req, res) => {
    /*
    #swagger.tags = ['User Watchlist']
    */
    user_model_1.default.findById(req.body.userId)
        .then((user) => {
        if (user.watchlist.includes(req.params.symbol)) {
            res.status(400).json({ message: "Already in watchlist" });
        }
        else {
            user.watchlist.push(req.params.symbol);
            user.save();
            res.status(200).json({ message: "Added to watchlist" });
        }
    })
        .catch((err) => {
        res.status(500).send({ message: err.message });
    });
};
const removeFromWatchlist = (req, res) => {
    /*
    #swagger.tags = ['User Watchlist']
    */
    user_model_1.default.findById(req.body.userId)
        .then((user) => {
        if (user.watchlist.includes(req.params.symbol)) {
            user.watchlist = user.watchlist.filter((symbol) => symbol !== req.params.symbol);
            user.save();
            res.status(200).json({ message: "Removed from watchlist" });
        }
        else {
            res.status(400).json({ message: "Not in watchlist" });
        }
    })
        .catch((err) => {
        res.status(500).send({ message: err.message });
    });
};
exports.default = {
    getLedger,
    getHoldings,
    getPortfolio,
    // Watchlist routes
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
};
