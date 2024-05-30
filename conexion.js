const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'hola123',
    database: 'suricata',
    port: 3307
});

connection.connect((err) => {
    if(err){
        console.error("Error de conexión", err);
        return;
    }
    console.log("Conexión establecida");
});

module.exports = connection;
