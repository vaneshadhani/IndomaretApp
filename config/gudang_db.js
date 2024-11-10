const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',       
    user: 'root',           
    password: '',            
    database: 'gudang'      
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the gudang database');
});

module.exports = connection;
