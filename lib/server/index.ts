import https from "https";
import express from "express";
import { router as indexRouter} from "./routes/index";
import fs from 'fs';

const app = express();

//Use the routers
app.use('/', indexRouter);

//Get the credentials
const credentials = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
}

//Get the server for the websocket
export const httpServer = https.createServer(credentials, app);