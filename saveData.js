const fs = require('fs');
const mysql = require('mysql2');
const connection = require('./conexion');

const temporizador = 5000; 

let lastProcessedTimestamp;


function obtenerUltimoTimestamp(callback) {
    const query = 'SELECT MAX(alertDate) as lastTimestamp FROM eventos';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener el último timestamp:', err);
            callback(err, null);
            return;
        }
        if (results.length > 0 && results[0].lastTimestamp) {
            lastProcessedTimestamp = new Date(results[0].lastTimestamp);
        } else {
            lastProcessedTimestamp = new Date('2024-04-11T20:26:20.987382');
        }
        callback(null, lastProcessedTimestamp);
    });
}


function procesarAlertas(alerts, callback) {
    let alertasProcesadas = 0; 

    alerts.forEach((alert) => {
        const { event_type } = alert;
        let { timestamp, src_ip, src_port, dest_ip, dest_port, proto } = alert;

        let alertTimestamp = new Date(timestamp);
        
        timestamp = timestamp.replace('T', ' ').split('.')[0] + '.' + timestamp.split('.')[1].split('+')[0];

        let signature_id, signature;
        if (event_type === 'stats') return;
        if (event_type !== 'alert') {
            signature_id = null;
            signature = null;
        } else {
            const { alert: { signature_id: sig_id, signature: sig } } = alert;
            signature_id = sig_id;
            signature = sig;
        }

        if (alertTimestamp > lastProcessedTimestamp) {
            const query = 'INSERT INTO eventos (alertDate, event_type, src_ip, src_port, dst_ip, dst_port, proto, signature_id, signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            connection.query(query, [timestamp, event_type, src_ip, src_port, dest_ip, dest_port, proto, signature_id, signature], (err, result) => {
                if (err) {
                    console.error('Error al insertar alerta en la base de datos:', err);
                    return;
                }
                console.log('Alerta insertada correctamente:', result.insertId);
                lastProcessedTimestamp = alertTimestamp;
                console.log('Timestamp nuevo:', lastProcessedTimestamp.toISOString());
                alertasProcesadas++; 
            });
        }
    });

    callback(null, alertasProcesadas);
}

function leerArchivo(callback) {
    const filePath = '/data/suricata/log/eve.json';
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return callback(err, 0);
        }

        try {
            const lines = data.split('\n').filter(line => line.trim() !== '');
            const alerts = lines.map((line, index) => {
                if (!line.trim().endsWith('}')) {
                    console.error(`Línea incompleta en el archivo JSON en la línea ${index + 1}:`, line);
                    return null;
                }
                try {
                    return JSON.parse(line);
                } catch (jsonError) {
                    console.error(`Error al parsear la línea ${index + 1}:`, line, jsonError);
                    return null;
                }
            }).filter(alert => alert !== null);
            procesarAlertas(alerts, callback);
        } catch (error) {
            console.error('Error al procesar el archivo JSON:', error);
            callback(error, 0);
        }
    });
}


function iniciarRevisionPeriodica() {
    obtenerUltimoTimestamp((err, lastTimestamp) => {
        if (err) {
            console.error('No se pudo obtener el último timestamp.');
            process.exit(1);
        }
        console.log('Último timestamp procesado:', lastTimestamp.toISOString());

        const revisar = () => {
            leerArchivo((error, alertasProcesadas) => {
                if (error) {
                    console.error('Error en el procesamiento de alertas:', error);
                } else {
                    console.log(`Revisión completada. Alertas procesadas: ${alertasProcesadas}`);
                    if (alertasProcesadas === 0) {
                        console.log('No hay nuevas alertas. Finalizando el proceso.');
                        connection.end((err) => {
                            if (err) {
                                console.error('Error al cerrar la conexión a la base de datos:', err);
                                return;
                            }
                            console.log('Conexión a la base de datos cerrada');
                            process.exit();
                        });
                    } else {
                        setTimeout(revisar, temporizador);
                    }
                }
            });
        };
        revisar();
    });
}


iniciarRevisionPeriodica();


connection.on('error', (err) => {
    console.error('Error en la conexión a la base de datos:', err);
});


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
