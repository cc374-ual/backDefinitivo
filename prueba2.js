const mysql = require('mysql2');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'hola123',
  database: 'suricata',
  port: 3307
});

// Consulta de inserción
const sqlQuery = "INSERT INTO eventos (alertDate, event_type, src_ip, src_port, dst_ip, dst_port, proto, signature_id, signature) VALUES (NOW(), 'dns', '192.168.227.128', 39598, '192.168.227.2', 53, 'UDP', NULL, NULL)";
console.log('Usuario de la base de datos:', connection.config.user);
// Conectar a la base de datos y ejecutar la consulta
console.log(sqlQuery);
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
