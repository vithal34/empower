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
exports.searchStocks = exports.fetchHistoricalStockData = exports.fetchStockData = void 0;
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const node_cache_1 = __importDefault(require("node-cache"));
const axios_1 = __importDefault(require("axios"));
const stockCache = new node_cache_1.default({ stdTTL: 60 }); // 1 minute
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const fetchStockData = (symbol) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = symbol + "-quote";
    try {
        if (stockCache.has(cacheKey)) {
            return stockCache.get(cacheKey);
        }
        else {
            const quote = yield yahoo_finance2_1.default.quoteCombine(symbol, {
                fields: [
                    "regularMarketPrice",
                    "regularMarketChangePercent",
                    "longName",
                    "regularMarketPreviousClose",
                ],
            });
            const { regularMarketPrice, regularMarketChangePercent, longName, regularMarketPreviousClose, } = quote;
            const stockData = {
                symbol,
                longName,
                regularMarketPrice,
                regularMarketPreviousClose,
                regularMarketChangePercent,
            };
            stockCache.set(cacheKey, stockData);
            return stockData;
        }
    }
    catch (err) {
        if (err.result && Array.isArray(err.result)) {
            let quote = err.result[0];
            const { regularMarketPrice, regularMarketChangePercent, longName, regularMarketPreviousClose, } = quote;
            const stockData = {
                symbol,
                longName,
                regularMarketPrice,
                regularMarketPreviousClose,
                regularMarketChangePercent,
            };
            stockCache.set(cacheKey, stockData);
            return stockData;
        }
        else {
            console.error(err);
            console.error("Error fetching " + symbol + " stock data:", err);
            throw new Error(err);
        }
    }
});
exports.fetchStockData = fetchStockData;
const fetchHistoricalStockData = (symbol, period = "1d") => __awaiter(void 0, void 0, void 0, function* () {
    const periodTerm = period === "1d" || period === "5d" || period === "1m" ? "short" : "long";
    const cacheKey = symbol + "-historical-" + periodTerm;
    try {
        if (stockCache.has(cacheKey)) {
            return stockCache.get(cacheKey);
        }
        else {
            let formattedData = [];
            if (periodTerm == "short") {
                // If the period is less than 1 month, use intraday data from Alpha Vantage
                let res = yield axios_1.default.get("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" +
                    symbol +
                    "&interval=15min&extended_hours=true&outputsize=full&apikey=" +
                    process.env.STOTRA_ALPHAVANTAGE_API);
                const alphaData = res.data["Time Series (15min)"];
                if (!alphaData) {
                    return (0, exports.fetchHistoricalStockData)(symbol, "6m");
                }
                formattedData = Object.keys(alphaData)
                    .map((key) => {
                    return [
                        new Date(key).getTime(),
                        parseFloat(alphaData[key]["4. close"]),
                    ];
                })
                    .sort((a, b) => a[0] - b[0]);
            }
            else {
                const yahooData = yield yahoo_finance2_1.default.historical(symbol, {
                    period1: "2000-01-01",
                    interval: "1d",
                });
                formattedData = yahooData.map((data) => {
                    return [data.date.getTime(), data.close];
                });
            }
            stockCache.set(cacheKey, formattedData);
            return formattedData;
        }
    }
    catch (error) {
        console.error("Error fetching " + symbol + " historical data:", error);
        return null;
    }
});
exports.fetchHistoricalStockData = fetchHistoricalStockData;
const searchStocks = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryOptions = {
        newsCount: 0,
        enableFuzzyQuery: true,
        enableNavLinks: false,
        enableCb: false,
        enableEnhancedTrivialQuery: false,
    };
    return yahoo_finance2_1.default
        .search(query, queryOptions)
        .then((results) => {
        return results.quotes;
    })
        .catch((err) => {
        if (err.result && Array.isArray(err.result.quotes)) {
            return err.result.quotes;
        }
        else {
            console.error(err);
            throw new Error(err);
        }
    });
});
exports.searchStocks = searchStocks;
