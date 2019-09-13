const http = require('http');
const express = require('express');

const app = express();

//Import the router
const indexRouter = require('./../routes/');

//Use the routers
app.all('/', indexRouter);

//Get the server for the websocket
module.exports = http.createServer(app);