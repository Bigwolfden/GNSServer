const express = require('express');
const app = express();

//Import the router
const indexRouter = require('./routes/index');

//Configure the port number
const PORT  = 3000;

//Use the routers
app.all('/', indexRouter);

//Listen
app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});