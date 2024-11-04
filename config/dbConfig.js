const sql = require('mssql');

const dbConfig = {
    user: 'sa',
    password: 'Man7equ!lla',
    server: 'DESKTOP-P8RVH97', // Usa solo el nombre de la máquina
    database: 'TallerMecanico',
    options: {
    
        encrypt: true, // O false según tu configuración
        trustServerCertificate: true // O false según tu configuración
    }
  };
  
  sql.connect(dbConfig).then(pool => {
      console.log('Conectado a SQL Server');
  }).catch(err => {
      console.error('Error al conectar a la base de datos:', err);
  });

  module.exports = dbConfig;
  