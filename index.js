var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var indexRouter = require("./routes/index");
var apiRouter = require("./routes/api");
var apiResponse = require("./helpers/apiResponse");
var cors = require("cors");
var bodyParser = require("body-parser");
var FormData = require('form-data');
// DB connection
var MONGODB_URL = process.env.MONGODB_URL;
var mongoose = require("mongoose");
mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
	//don't show the log when it is test
	if(process.env.NODE_ENV !== "CourseProject") {
		console.log("Connected to %s", MONGODB_URL);
		console.log("App is running ... \n");
		console.log("Press CTRL + C to stop the process. \n");
	}
})
	.catch(err => {
		console.error("App starting error:", err.message);
		process.exit(1);
	});
var db = mongoose.connection;

var app = express();

// //don't show the log when it is test
if(process.env.NODE_ENV !== "CourseProject") {
	app.use(logger("dev"));
}
// // app.use(express.urlencoded({extended: true}));
// // app.use(express.json()) // To parse the incoming requests with JSON payloads

app.use(express.static(__dirname));
app.use(express.json());
app.use(express.static("uploads"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// //To allow cross-origin requests
app.use(bodyParser.json());
app.use(cors());
// console.log('aaaaaaaaaaaaaa')
// //Route Prefixes

app.use("/", indexRouter);
app.use("/api/", apiRouter);

// // throw 404 if URL not found
app.all("*", function(req, res) {
	return apiResponse.notFoundResponse(res, "Page not found");
});

app.use((err, req, res) => {
	if(err.name == "UnauthorizedError"){
		return apiResponse.unauthorizedResponse(res, err.message);
	}
});

app.use(function (err, req, res, next) {
	if (err.name === 'UnauthorizedError') {
		var data = {
			status: 500,
			message: 'invalid token...',
		};
	  return res.status(401).json(data);
	  res.status(401).send('invalid token...');
	}
  });
console.log('App.js-------------')
// listen on port 3000
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});

module.exports = app;
