const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// CONECTARSE A LA BASE DE DATOS
const sql = require('mssql');


const dbConfig = {
  user: 'sa',
  password: 'carlos0996',
  server: 'localhost', // Usa solo el nombre de la máquina
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

// Ruta para manejar el login
const bcrypt = require('bcrypt');

// Ruta para el inicio de sesión
app.post('/login', async (req, res) => {
  const { email, password } = req.body; // Usamos email y no username
  try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
          .input('email', sql.VarChar, email)
          .query('SELECT * FROM Usuarios WHERE Email = @email');

      if (result.recordset.length > 0) {
          const user = result.recordset[0];
          const isMatch = await bcrypt.compare(password, user.Contraseña);

          if (isMatch) {
              return res.status(200).json({ message: 'Login exitoso' });
          } else {
              return res.status(401).json({ message: 'Contraseña incorrecta' });
          }
      } else {
          return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  } catch (error) {
      console.error('Error en el servidor:', error);
      res.status(500).json({ message: 'Error del servidor' });
  }
});

//Crear Usuarios con contraseñas hasheadas.
// Suponiendo que tienes una conexión a la base de datos ya establecida
// async function crearUsuarios() {
//   try {
//       const pool = await sql.connect(dbConfig); // Asegúrate de que dbConfig esté definido correctamente
//       const hashedPassword = await bcrypt.hash('nueva_contraseña', 10); // Cambia 'nueva_contraseña' según sea necesario

//       await pool.request()
//           .input('Nombre', sql.NVarChar, 'Admin User')
//           .input('Email', sql.NVarChar, 'admin@example.com')
//           .input('Contraseña', sql.NVarChar, hashedPassword)
//           .input('Rol', sql.NVarChar, 'Administrador')
//           .query('INSERT INTO Usuarios (Nombre, Email, Contraseña, Rol) VALUES (@Nombre, @Email, @Contraseña, @Rol)');

//       console.log('Usuario creado exitosamente');
//   } catch (error) {
//       console.error('Error al crear usuario:', error);
//   }
// }

// crearUsuarios();


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});