const http = require('http');
const express = require('express');
const app = express();

//Import the router
const indexRouter = require('./routes/index');

//Configure the port number
const PORT  = 3000;

//Use the routers
app.all('/', indexRouter);

//Get the server for the websocket
const server = http.createServer(app);

//Listen
server.listen(PORT, () => {
    console.log((new Date()) + ' Listening on port: ' + PORT.toString());
});