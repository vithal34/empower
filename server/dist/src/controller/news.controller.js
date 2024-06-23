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
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { SearchApi } = require("financial-news-api");
const searchApi = SearchApi(process.env.STOTRA_NEWSFILTER_API);
// Cache the results for 15 minutes
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 15 * 60 });
const getNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /*
    #swagger.tags = ['News']
    */
    var symbol = req.params.symbol || "";
    const symbolQuery = symbol !== "" ? "symbols:" + symbol + " AND " : "";
    if (cache.has(symbol + "-news")) {
        res.status(200).json(cache.get(symbol + "-news"));
        return;
    }
    // If no API key for NewsFilter is provided, use Yahoo Finance API
    if (process.env.STOTRA_NEWSFILTER_API === undefined ||
        process.env.STOTRA_NEWSFILTER_API === "") {
        console.warn("No NewsFilter API key provided. Using Yahoo Finance API.");
        yahooNews(symbol)
            .then((news) => {
            res.status(200).json(news);
        })
            .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
        return;
    }
    const query = {
        queryString: symbolQuery +
            "(source.id:bloomberg OR source.id:reuters OR source.id:cnbc OR source.id:wall-street-journal)",
        from: 0,
        size: 10,
    };
    searchApi
        .getNews(query)
        .then((response) => {
        let news = response.articles.map((newsItem) => {
            return {
                title: newsItem.title,
                publishedAt: newsItem.publishedAt,
                source: newsItem.source.name,
                sourceUrl: newsItem.sourceUrl,
                symbols: newsItem.symbols,
                description: newsItem.description,
            };
        });
        cache.set(symbol + "-news", news);
        res.status(200).json(news);
    })
        .catch((err) => {
        if (err.response && err.response.data && err.response.data.message) {
            // Retry with Yahoo Finance API if Newsfilter quota is exceeded
            yahooNews(symbol)
                .then((news) => {
                res.status(200).json(news);
            })
                .catch((err) => {
                console.log(err);
                res.status(500).json(err);
            });
        }
        else {
            console.log(err);
            res.status(500).json(err);
        }
    });
});
function yahooNews(symbol) {
    const options = {
        quotesCount: 0,
        newsCount: 10,
    };
    if (symbol === "") {
        symbol = "stock";
    }
    return yahoo_finance2_1.default
        .search(symbol || "", options)
        .then((response) => {
        let news = response.news.map((newsItem) => {
            return {
                title: newsItem.title,
                publishedAt: newsItem.providerPublishTime,
                source: newsItem.publisher,
                sourceUrl: newsItem.link,
                symbols: newsItem.relatedTickers || [],
                description: "",
            };
        });
        cache.set(symbol + "-news", news);
        return news;
    })
        .catch((err) => {
        console.log(err);
        throw new Error(err);
    });
}
exports.default = { getNews };
