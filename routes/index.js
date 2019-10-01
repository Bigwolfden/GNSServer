const express = require('express');
const pool = require('../server/database');
const router = express.Router();


router.get('/', (req, res) => {
    res.send('Hello World!');
});
router.post('/test', (req, res) => {
    pool.query("INSERT INTO clients (first_name, last_name, phone, email, street_address, city, state) VALUES ('Ryan', 'Wolf', '9375555555', 'ryan@gns.com', '123 fake street', 'Dayton', 'OH')");
    console.log("The test url has been hit with a post request!");
    res.sendStatus(200);
    console.log("Here's everything in the clients database: ");
    const clients = pool.query('SELECT * FROM clients');
    console.log(clients);
});


//Export the router
module.exports = router;