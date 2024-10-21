

const express = require('express');
const sql = require('mssql');
const authRoutes = require('./routes/auth'); // Importar las rutas de autenticación
const agregarUsuarioRoutes = require('./routes/agregarUsuario');
const changePasswordRoutes = require('./routes/changePasswordRoutes');
const dbConfig = require('./config/dbConfig'); // Asegúrate de importar tu configuración de DB
const cors = require('cors');



const app = express();
app.use(cors()); // Middleware de CORS debe estar antes de las rutas
app.use(express.json()); // Middleware para parsear el JSON

app.use('/auth', authRoutes); // Usar las rutas de autenticación
app.use('/usuarios', agregarUsuarioRoutes);
app.use('/api/password', changePasswordRoutes); 

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

app.put('/api/usuarios/Primer_ingreso', async (req, res) => {
    const { email } = req.body;
    try {
      await pool.query('UPDATE Usuarios SET Primer_ingreso = 0 WHERE Email = ?', [email]);
      res.status(200).json({ message: 'Primer ingreso actualizado con éxito' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el primer ingreso' });
    }
  });

//Mecanico
//carsan@gmail.com
//asdf1234

//Administrador
//admin@example.com
//nueva_contraseña


// async function crearUsuarios() {
//   try {
//       const pool = await sql.connect(dbConfig); // Asegúrate de que dbConfig esté definido correctamente
//       const hashedPassword = await bcrypt.hash('asdf1234', 10); // Cambia 'nueva_contraseña' según sea necesario

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


