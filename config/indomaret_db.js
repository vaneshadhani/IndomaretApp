const mysql = require('mysql');

const indomaretDB = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'indomaret'
});

indomaretDB.connect((err) => {
    if (err) {
        console.error('Error connecting to the Indomaret database:', err);
    } else {
        console.log('Connected to the Indomaret database.');
    }
});

indomaretDB.on('error', (err) => {
    console.error('Database error occurred:', err);
});

module.exports = indomaretDB;
