import * as http from "http";
import express from "express";
import { router as indexRouter} from "./routes/index";

const app = express();

//Use the routers
app.use('/', indexRouter);

//Get the server for the websocket
export const httpServer = http.createServer(app);