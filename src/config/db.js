const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit:10,
});
connection.connect((err) => {
    if(err){
        console.error(`Error connection messege(${err.message})`);
        process.exit(1);
    }
    else{
        console.log(`MySQL connected ${process.env.DB_HOST}`);
    }
});

module.exports = connection;