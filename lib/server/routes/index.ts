import * as express from "express";
import {pool} from '../database';
export const router = express.Router();


router.get('/', (req, res) => {
    res.send('Hello World!');
});
router.get('/clients', async (req, res) => {
    let clients = await pool.query('SELECT * FROM clients');
    res.json(clients.rows);
    console.log(clients.rows);
});
router.post('/test', async (req, res) => {
    console.log("The test url has been hit with a post request!");

    await pool.query("INSERT INTO clients (first_name, last_name, phone, email, street_address, city, state) VALUES ('Ryan', 'Wolf', '9375555555', 'ryan@gns.com', '123 fake street', 'Dayton', 'OH')");
    
    console.log("Here's everything in the clients database: ");
    let result = await pool.query('SELECT * FROM clients');
    console.log(result.rows);
    res.sendStatus(200);
});