import * as express from "express";
import {pool} from '../database';
import path from "path";
export const router = express.Router();


router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../KioskAppJQueryMobile/KioskApp.html'));
});
router.get('/clients', async (req, res) => {
    let clients = await pool.query('SELECT * FROM clients');
    res.json(clients.rows);
    console.log(clients.rows);
});
router.post('/add', async (req, res) => {
    //Get the values from the body of the request
    const {first_name, last_name, phone_number, email, address, city, zip, state} = req.body;
    const values = [first_name, last_name, phone_number, email, address, city, zip, state];
    console.log(values);
    //Add them to the database
    await pool.query("INSERT INTO clients (first_name, last_name, phone, email, street_address, city, zip, state, date_added, stage) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, current_timestamp, 1);", values);
    
    res.sendStatus(200);
});