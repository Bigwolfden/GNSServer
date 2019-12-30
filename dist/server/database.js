"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pg_1 = require("pg");
var dotenv_1 = require("dotenv");
dotenv_1.config();
exports.connection = new pg_1.Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: 'gns',
    password: process.env.DB_PASSWORD,
    port: 5432
});
