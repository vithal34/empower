"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_autogen_1 = __importDefault(require("swagger-autogen"));
const package_json_1 = require("../../package.json");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// const options = {
// 	definition: {
// 		openapi: "3.0.0",
// 		info: {
// 			title: "Stock Trading Simulator API",
// 			version: version,
// 			description: "A REST API for the Stock Trading Simulator",
// 		},
// components: {
// 	securitySchemes: {
// 		bearerAuth: {
// 			type: "http",
// 			scheme: "bearer",
// 			bearerFormat: "JWT",
// 		},
// 	},
// },
// security: [
// 	{
// 		bearerAuth: [],
// 	},
// ],
// 	},
// };
const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes"];
function swaggerDocs(app, port) {
    const doc = {
        info: {
            title: "Stock Trading Simulator API",
            description: "A REST API for the Stock Trading Simulator",
            version: package_json_1.version,
        },
        host: "0.0.0.0:" + port,
        securityDefinitions: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
        servers: [
            { url: process.env.STOTRA_SERVER_URL || `http://0.0.0.0:${port}` },
        ],
    };
    const autogen = (0, swagger_autogen_1.default)({
        openapi: "3.0.0",
        servers: [{ url: "/x" }],
    })(outputFile, endpointsFiles, doc).then(() => {
        const swaggerDocument = require("." + outputFile);
        app.use("/api/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument, {
            swaggerOptions: { persistAuthorization: true },
        }));
        console.log(`Swagger docs available at http://0.0.0.0:${port}/api/docs`);
    });
}
exports.swaggerDocs = swaggerDocs;
