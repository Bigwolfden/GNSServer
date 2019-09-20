const Pool = require('pg').Pool;
const connection = new Pool({
    user: 'user',
    host: 'localhost',
    database: 'gns',
    password: 'password',
    port: 5432
});
module.exports = connection;