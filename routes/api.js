var express = require("express");
var authRouter = require("./auth");
var courseRouter = require('./courses')


var app = express();

const he  = () => {
  console.log("hello")
  return  "hello"
}

app.use("/auth/", authRouter);
app.use('/course', courseRouter);

module.exports = app;
