import mongoose from "mongoose";
mongoose.Promise = global.Promise;

require("dotenv").config();

// Read password from dotenv file
const password = "vithal";

const uri =
	"mongodb+srv://vithal:<vithal>@empower0.devg6pb.mongodb.net/";

mongoose.connect(uri);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", () => {
	console.log("Connected to Database");
});

module.exports = db;
