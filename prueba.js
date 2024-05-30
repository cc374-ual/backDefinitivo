const mysql = require('mysql2');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'hola123',
  database: 'eventos'
});

// Consulta de inserción
const sqlQuery = "INSERT INTO eventos (alertDate, event_type, src_ip, src_port, dst_ip, dst_port, proto, signature_id, signature) VALUES ('2024-05-18 15:47:20.902651', 'dns', '192.168.227.128', 39598, '192.168.227.2', 53, 'UDP', NULL, NULL)";

// Conectar a la base de datos y ejecutar la consulta
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
    return;
  }
  
  console.log('Conexión a la base de datos establecida');
  
  connection.query(sqlQuery, (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      return;
    }
    
    console.log('Consulta ejecutada con éxito:', results);
    
    // Cerrar la conexión a la base de datos
    connection.end();
  });
});
