import {Pool} from "pg";
import {config} from "dotenv";
config();
export const pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: 'gns',
    password: process.env.DB_PASSWORD,
    port: 5432
});