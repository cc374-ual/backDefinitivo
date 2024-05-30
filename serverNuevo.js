const express = require('express');
const yaml = require('js-yaml');
const fs = require('fs');
const connection = require('./conexion.js');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const {exec} = require('child_process'); //Para ejecutar comandos bash
const os = require('os');
const { stdout } = require('process');
app.use(cors());
app.use(bodyParser.json());
app.use(express.json())


app.get('/', (req, res) => {
  const textYaml = fs.readFileSync("/data/suricata/etc/suricata.yaml");
  const textNormal = yaml.load(textYaml);
  console.log(os.userInfo().username);
  res.json(textNormal);
});

app.post('/guardar-cambios-regla', (req,res) => {
try{
  console.log(req.body.textoRegla);
  let contenidoReglas = fs.readFileSync("/var/lib/suricata/rules/local.rules", 'utf8');
  contenidoReglas += '\n' + req.body.textoRegla + '\n';
  fs.writeFileSync("/var/lib/suricata/rules/local.rules", contenidoReglas, 'utf8');

  exec('docker ps -a --format "{{.ID}}|{{.Names}}"', (error, stdout) => {
    if (error) {
      console.error(`Error al ejecutar el comando: ${error}`);
      return res.status(500).send('Error al obtener la lista de contenedores.');
    }

    const lineas = stdout.trim().split('\n');
    let id;

    for (let linea of lineas) {
      const partes = linea.split('|');
      const nombre = partes[1].split(" ")[0];
      if (nombre === 'suricata') {
        id = partes[0].split(" ")[0];
        break;
      }
    }

    if (!id) {
      return res.status(404).send('Contenedor no encontrado.');
    }

    exec('docker restart ' + id, (error) => {
      if (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        return res.status(500).send('Error al intentar arrancar el contenedor');
      }
      return res.json({ mensaje: 'Los cambios se guardaron correctamente y el contenedor se reinició exitosamente.' });
    });
  });
} catch (error) {
  return res.status(500).json({ error: 'No se pudieron guardar los cambios' });
}
});


app.post('/guardar-cambiosConfigGeneral', (req,res) => {
  try{
    console.log(req.body);
    const valoresActualizados = req.body;


    let contenidoYAML = fs.readFileSync("/data/suricata/etc/suricata.yaml", 'utf8');

    contenidoYAML = contenidoYAML.replace(/HOME_NET: .*/, `HOME_NET: "[${valoresActualizados.homeNet}]"`);
    contenidoYAML = contenidoYAML.replace(/af-packet:\n\s*- interface: .*\n/, `af-packet:\n  - interface: ${valoresActualizados.interfaz}\n`);

    fs.writeFileSync("/data/suricata/etc/suricata.yaml",contenidoYAML,'utf8');

    exec('docker ps -a --format "{{.ID}}|{{.Names}}"', (error, stdout) => {
      if (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        return res.status(500).send('Error al obtener la lista de contenedores.');
      }

      const lineas = stdout.trim().split('\n');
      let id;

      for (let linea of lineas) {
        const partes = linea.split('|');
        const nombre = partes[1].split(" ")[0];
        if (nombre === 'suricata') {
          id = partes[0].split(" ")[0];
          break;
        }
      }

      if (!id) {
        return res.status(404).send('Contenedor no encontrado.');
      }

      exec('docker restart ' + id, (error) => {
        if (error) {
          console.error(`Error al ejecutar el comando: ${error}`);
          return res.status(500).send('Error al intentar arrancar el contenedor');
        }
        return res.json({ mensaje: 'Los cambios se guardaron correctamente y el contenedor se reinició exitosamente.' });
      });
    });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudieron guardar los cambios' });
  }
});


app.post('/guardar-cambios', (req, res) => {
  try {
    console.log(req.body);
    const valoresActualizados = req.body;

    let contenidoYAML = fs.readFileSync("/data/suricata/etc/suricata.yaml", 'utf8');
    console.log(contenidoYAML);
    
    contenidoYAML = contenidoYAML.replace(/HTTP_SERVERS: .*/, `HTTP_SERVERS: "${valoresActualizados.httpServer}"`);
    contenidoYAML = contenidoYAML.replace(/DNS_SERVERS: .*/, `DNS_SERVERS: "${valoresActualizados.dnsServer}"`);
    contenidoYAML = contenidoYAML.replace(/AIM_SERVERS: .*/, `AIM_SERVERS: "${valoresActualizados.aimServer}"`);
    contenidoYAML = contenidoYAML.replace(/SQL_SERVERS: .*/, `SQL_SERVERS: "${valoresActualizados.sqlServer}"`);
    contenidoYAML = contenidoYAML.replace(/DNP3_SERVER: .*/, `DNP3_SERVER: "${valoresActualizados.dnp3Server}"`);
    contenidoYAML = contenidoYAML.replace(/DNP3_CLIENT: .*/, `DNP3_CLIENT: "${valoresActualizados.dnp3Client}"`);
    contenidoYAML = contenidoYAML.replace(/ENIP_CLIENT: .*/, `ENIP_CLIENT: "${valoresActualizados.enipClient}"`);
    contenidoYAML = contenidoYAML.replace(/ENIP_SERVER: .*/, `ENIP_SERVER: "${valoresActualizados.enipServer}"`);
    
    fs.writeFileSync("/data/suricata/etc/suricata.yaml", contenidoYAML, 'utf8');

    exec('docker ps -a --format "{{.ID}}|{{.Names}}"', (error, stdout) => {
      if (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        return res.status(500).send('Error al obtener la lista de contenedores.');
      }

      const lineas = stdout.trim().split('\n');
      let id;

      for (let linea of lineas) {
        const partes = linea.split('|');
        const nombre = partes[1].split(" ")[0];
        if (nombre === 'suricata') {
          id = partes[0].split(" ")[0];
          break;
        }
      }

      if (!id) {
        return res.status(404).send('Contenedor no encontrado.');
      }

      exec('docker restart ' + id, (error) => {
        if (error) {
          console.error(`Error al ejecutar el comando: ${error}`);
          return res.status(500).send('Error al intentar arrancar el contenedor');
        }
        return res.json({ mensaje: 'Los cambios se guardaron correctamente y el contenedor se reinició exitosamente.' });
      });
    });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudieron guardar los cambios' });
  }
});


app.get('/alertas', (req, res) => {
  let sqlQuery = "select * from eventos where event_type='alert' and src_ip not like 'ff02%' and src_ip not like 'fe80%' and src_ip not like '0000:%' order by alertDate desc";
  connection.query(sqlQuery,(err,results) => {
    if(err)
    {
      console.error('Error al ejecutar la consulta: ', err);
      res.status(500).json({ error: 'Error al obtener los registros de la base de datos'});
      return;
    }
    res.json(results);
  });
});

app.get('/numeroAlertas', (req, res) => {
  let sqlQuery = "select count(*) as contador from eventos where event_type='alert' and src_ip not like 'ff02%' and src_ip not like 'fe80%' and src_ip not like '0000:%'";
  connection.query(sqlQuery,(err,results) => {
    if(err)
    {
      console.error('Error al ejecutar la consulta: ', err);
      res.status(500).json({ error: 'Error al obtener los registros de la base de datos'});
      return;
    }
    res.json(results);
  });
});

app.get('/alertasProtocolo', (req, res) => {
  let sqlQuery = "select proto, count(*) as total from eventos where event_type='alert' and src_ip not like 'ff02%' and src_ip not like 'fe80%' and src_ip not like '0000:%' and proto !='0' group by proto";
  connection.query(sqlQuery,(err,results) => {
    if(err)
    {
      console.error('Error al ejecutar la consulta: ', err);
      res.status(500).json({ error: 'Error al obtener los registros de la base de datos'});
      return;
    }
    console.log(results);
    res.json(results);
  });
});

app.get('/alertasIpFuente', (req, res) => {
  let sqlQuery = "select src_ip, count(*) as total from eventos where event_type='alert' and src_ip not like 'ff02%' and src_ip not like 'fe80%' and src_ip not like '0000:%' group by src_ip";
  connection.query(sqlQuery,(err,results) => {
    if(err)
    {
      console.error('Error al ejecutar la consulta: ', err);
      res.status(500).json({ error: 'Error al obtener los registros de la base de datos'});
      return;
    }
    console.log(results);
    res.json(results);
  });
});

app.get('/alertasIpDestino', (req, res) => {
  let sqlQuery = "select dst_ip, count(*) as total from eventos where event_type='alert' and dst_ip not like 'ff02%' group by dst_ip";
  connection.query(sqlQuery,(err,results) => {
    if(err)
    {
      console.error('Error al ejecutar la consulta: ', err);
      res.status(500).json({ error: 'Error al obtener los registros de la base de datos'});
      return;
    }
    console.log(results);
    res.json(results);
  });
});

app.get('/alertasPuertoDestino', (req, res) => {
  let sqlQuery = "select dst_port, count(*) as total from eventos where event_type='alert' and src_ip not like 'ff02%' and src_ip not like 'fe80%' and src_ip not like '0000:%' and dst_port!= 0 group by dst_port";
  connection.query(sqlQuery,(err,results) => {
    if(err)
    {
      console.error('Error al ejecutar la consulta: ', err);
      res.status(500).json({ error: 'Error al obtener los registros de la base de datos'});
      return;
    }
    console.log(results);
    res.json(results);
  });

});

app.get('/ipDestinoMasAlertas', (req, res) => {
  let sqlQuery = "select dst_ip, count(*) as total from eventos where event_type='alert' and src_ip not like 'ff02%' and src_ip not like 'fe80%' and src_ip not like '0000:%' and dst_ip not like 'ff02%' group by dst_ip order by count(*) desc limit 1";
  connection.query(sqlQuery,(err,results) => {
    if(err)
    {
      console.error('Error al ejecutar la consulta: ', err);
      res.status(500).json({ error: 'Error al obtener los registros de la base de datos'});
      return;
    }
    console.log(results);
    res.json(results);
  });

});

app.get('/protocoloMasAlertas', (req, res) => {
  let sqlQuery = "select proto, count(*) as total from eventos where event_type='alert' and proto!= '0' and dst_ip not like 'ff02%'and src_ip not like 'ff02%' and src_ip not like 'fe80%' and src_ip not like '0000:%'  group by proto order by count(*) desc limit 1";
  connection.query(sqlQuery,(err,results) => {
    if(err)
    {
      console.error('Error al ejecutar la consulta: ', err);
      res.status(500).json({ error: 'Error al obtener los registros de la base de datos'});
      return;
    }
    console.log(results);
    res.json(results);
  });

});

app.get('/puertoDestinoMasAlertas', (req, res) => {
  let sqlQuery = "select dst_port, count(*) as total from eventos where event_type='alert' and src_ip not like 'ff02%' and src_ip not like 'fe80%' and src_ip not like '0000:%' and dst_ip not like 'ff02%' and dst_port != 0 group by dst_port order by count(*) desc limit 1";
  connection.query(sqlQuery,(err,results) => {
    if(err)
    {
      console.error('Error al ejecutar la consulta: ', err);
      res.status(500).json({ error: 'Error al obtener los registros de la base de datos'});
      return;
    }
    console.log(results);
    res.json(results);
  });

});


app.get('/estado-contenedores',(req,res) => {

  exec('docker ps -a --format "{{.Status}}|{{.Names}}|{{.Ports}}"', (error, stdout) => {
    if (error) {
      console.error(`Error al ejecutar el comando: ${error}`);
      res.status(500).send('Error al obtener la lista de contenedores.');
      return;
    }
  
     const lineas = stdout.trim().split('\n');
     const estados = {};
     lineas.forEach(linea =>{
      const partes = linea.split('|');
      const estado = partes[0].split(" ")[0];
      const nombre = partes[1].split(" ")[0];
      const puertos = partes[2];
      const puertosProcesados = puertos ? puertos.split(', ').map(puerto => puerto.trim()): [];
      estados[nombre] = {
        estado: estado,
        puertos:puertosProcesados
      };
     });
     res.json(estados);
  });
});

app.post('/actualizar-estado',(req,res)=>{
  console.log(req.body);
  const nombreContenedor = req.body.nombre;
  const indicador = req.body.indicador;

  exec('docker ps -a --format "{{.ID}}|{{.Status}}|{{.Names}}"', (error, stdout) => {
    if (error) {
      console.error(`Error al ejecutar el comando: ${error}`);
      res.status(500).send('Error al obtener la lista de contenedores.');
      return;
    }

    const lineas = stdout.trim().split('\n');
    let id;

    lineas.forEach(linea => {
      const partes = linea.split('|');
      const nombre = partes[2].split(" ")[0];
      if (nombre == nombreContenedor) {
        id = partes[0].split(" ")[0];

        if (indicador == "Inactivo") {
          exec('docker start ' + id, (error) => {
            if (error) {
              console.error(`Error al ejecutar el comando: ${error}`);
              res.status(500).send('Error al intentar arrancar el contenedor');
              return;
            }
            
            res.status(200).send('Contenedor iniciado exitosamente.');
          });
        } else {
          exec('docker stop ' + id, (error) => {
            if (error) {
              console.error(`Error al ejecutar el comando: ${error}`);
              res.status(500).send('Error al intentar detener el contenedor');
              return;
            }
           
            res.status(200).send('Contenedor detenido exitosamente.');
          });
        }
      }
    });

    
    if (!id) {
      res.status(404).send('Contenedor no encontrado.');
    }
  });


});

app.listen(PORT, '192.168.227.128', () => {
  console.log(`Servidor Express en ejecución en el puerto ${PORT}`);
});

