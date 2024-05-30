const fs = require('fs');
const mysql = require('mysql2');
const connection = require('./conexion')

connection.connect((err) => {
    if (err) {
      console.error('Error de conexión a la base de datos:', err);
      return;
    }
    console.log('Conexión a la base de datos establecida');
  });
  
  // Ruta al archivo eve.json
  const filePath = '/data/suricata/log/eve.json';
  
  // Variable global para almacenar el último timestamp procesado
  let lastProcessedTimestamp = new Date('2024-04-11T20:26:20.987382').toISOString().replace('T', ' ');
  
  // Función para procesar y guardar alertas
  function procesarAlertas(alerts) {
    alerts.forEach((alert) => {
      const { event_type} = alert;
      let {timestamp, src_ip, src_port, dest_ip, dest_port, proto } = alert;
      
      //timestamp = timestamp.replace(/[^\d\-T:.]/g, ' ');
       //timestamp = timestamp.split(' ')[0].replace('T', ' ');
      timestamp = timestamp.replace('T', ' ').split('.')[0] + '.' + timestamp.split('.')[1].split('+')[0];
      let signature_id, signature;

      if(event_type !== 'alert'){
        signature_id = null;
        signature = null;
        }else {
          const {alert: {signature_id : sig_id, signature: sig}} = alert;
          signature_id = sig_id;
          signature = sig;
        }
      

      // Convertir el timestamp a un objeto Date
     
  
      // Verificar si la alerta es nueva
      if (timestamp > lastProcessedTimestamp) {
        const query = 'INSERT INTO eventos (alertDate, event_type, src_ip, src_port, dst_ip, dst_port, proto, signature_id,signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        connection.query(query, [timestamp, event_type, src_ip, src_port, dest_ip, dest_port, proto, signature_id, signature ], (err, result) => {
          if (err) {
            console.error('Error al insertar alerta en la base de datos:', err);
            return;
          }
          console.log('Alerta insertada correctamente:', result.insertId);
        });
  
        // Actualizar el último timestamp procesado
        lastProcessedTimestamp = timestamp;
      
     }
    });
  }
  
  // Función para leer y procesar el archivo eve.json
  function leerArchivo() {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo:', err);
        return;
      }
  
      try {
        const alerts = data.split('\n').filter(line => line.trim() !== '').map(line => JSON.parse(line));
        procesarAlertas(alerts);
      } catch (error) {
        console.error('Error al procesar el archivo JSON:', error);
      }
    });
  }
  
  // Leer el archivo eve.json cada cierto intervalo de tiempo
  setInterval(() => {
    leerArchivo();
  }, 5000); // Intervalo de 5 segundos (ajusta según tus necesidades)
  
  // Manejar errores de la conexión a la base de datos
  connection.on('error', (err) => {
    console.error('Error en la conexión a la base de datos:', err);
  });
  
  // Cerrar la conexión a la base de datos cuando se finalice el proceso
  process.on('SIGINT', () => {
    console.log('Cerrando conexión a la base de datos...');
    connection.end((err) => {
      if (err) {
        console.error('Error al cerrar la conexión a la base de datos:', err);
        return;
      }
      console.log('Conexión a la base de datos cerrada');
      process.exit();
    });
  });
