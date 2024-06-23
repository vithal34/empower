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
const getInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /*
    #swagger.tags = ['Stock Data']
    */
    const symbol = req.params.symbol;
    const quote = yield (0, requests_1.fetchStockData)(symbol);
    res.status(200).send(quote);
});
const getHistorical = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    /*
    #swagger.tags = ['Stock Data']
    */
    const symbol = req.params.symbol;
    const period = (_a = req.query.period) === null || _a === void 0 ? void 0 : _a.toString();
    try {
        const historicalData = yield (0, requests_1.fetchHistoricalStockData)(symbol, period);
        res.status(200).send(historicalData);
    }
    catch (error) {
        console.error("Error fetching " + symbol + " stock data:", error);
        res.status(500).send("Error fetching " + symbol + " stock data:" + error);
    }
});
const buyStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /*
    #swagger.tags = ['Stock Transaction']
    */
    const symbol = req.params.symbol;
    const quantity = req.body.quantity;
    try {
        const data = yield (0, requests_1.fetchStockData)(symbol);
        const price = data.regularMarketPrice;
        let user = yield user_model_1.default.findById(req.body.userId);
        user = user;
        if (user.cash < price * quantity) {
            res.status(400).send({ message: "Not enough cash" });
        }
        else {
            user.cash -= price * quantity;
            // Add sebuyll transaction to ledger
            const transaction = {
                symbol,
                price,
                quantity,
                type: "buy",
                date: Date.now(),
            };
            user.ledger.push(transaction);
            // Add position to user
            const position = {
                symbol,
                quantity,
                purchasePrice: price,
                purchaseDate: Date.now(),
            };
            user.positions.push(position);
            user
                .save()
                .then((user) => {
                if (user) {
                    res.status(200).send({ message: "Stock was bought successfully!" });
                }
            })
                .catch((err) => {
                if (err) {
                    res.status(500).send({ message: err });
                }
            });
        }
    }
    catch (error) {
        console.error("Error fetching " + symbol + " stock data:", error);
        res.status(500).send("Error fetching " + symbol + " stock data:" + error);
    }
});
const sellStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /*
    #swagger.tags = ['Stock Transaction']
    */
    const symbol = req.params.symbol;
    var quantity = req.body.quantity;
    try {
        const data = yield (0, requests_1.fetchStockData)(symbol);
        const price = data.regularMarketPrice;
        let user = yield user_model_1.default.findById(req.body.userId);
        user = user;
        // Check if user has enough shares to sell across all positions
        let quantityOwned = 0;
        user.positions.forEach((position) => {
            if (position.symbol === symbol) {
                quantityOwned += position.quantity;
            }
        });
        if (quantityOwned < quantity) {
            res.status(400).send({ message: "Not enough shares" });
            return;
        }
        user.cash += price * quantity;
        // Add sell transaction to ledger
        const transaction = {
            symbol,
            price,
            quantity,
            type: "sell",
            date: Date.now(),
        };
        user.ledger.push(transaction);
        // Sell quantity of shares (decrement for each iteration of the loop) split between all positions of the same symbol
        for (let i = 0; i < user.positions.length; i++) {
            if (user.positions[i].symbol === symbol) {
                if (user.positions[i].quantity > quantity) {
                    user.positions[i].quantity -= quantity;
                    break;
                }
                else {
                    quantity -= user.positions[i].quantity;
                    user.positions.splice(i, 1);
                    i--;
                }
            }
        }
        user
            .save()
            .then((user) => {
            if (user) {
                res.send({ message: "Stock was sold successfully!" });
            }
        })
            .catch((err) => {
            if (err) {
                res.status(500).send({ message: err });
            }
        });
    }
    catch (error) {
        console.error("Error fetching " + symbol + " stock data:", error);
        res.status(500).send("Error fetching " + symbol + " stock data:" + error);
    }
});
const search = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /*
    #swagger.tags = ['Stock Data']
    */
    const { query } = req.params;
    if (!query)
        res.status(400).send({ message: "No query provided" });
    (0, requests_1.searchStocks)(query)
        .then((quotes) => {
        let stocksAndCurrencies = quotes.filter((quote) => {
            return (quote.quoteType &&
                quote.quoteType !== "FUTURE" &&
                quote.quoteType !== "Option");
        });
        res.status(200).send(stocksAndCurrencies);
    })
        .catch((err) => {
        console.log(err);
        res.status(500).send({ message: err });
    });
});
exports.default = { getInfo, getHistorical, buyStock, sellStock, search };
