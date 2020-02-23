import https from "https";
import express from "express";
import { router as indexRouter} from "./routes/index";
import bodyParser from 'body-parser';
import fs from 'fs';

//Intialize the express application
const app = express();

//Form parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Use the routers
app.use('/', indexRouter);
//Static files for the Kiosk
app.use(express.static(__dirname + "../../../KioskAppJQueryMobile"));

//Get the credentials
const credentials = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
}

//Get the server for the websocket
export const httpServer = https.createServer(credentials, app);