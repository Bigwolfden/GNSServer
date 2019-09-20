const express = require('express');
const pool = require('../server/database');
const router = express.Router();


router.get('/', (req, res) => {
    res.send('Hello World!');
});
router.post('/test', (req, res) => {
    pool.query();
});


//Export the router
module.exports = router;