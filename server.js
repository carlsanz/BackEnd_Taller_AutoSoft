

const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const authRoutes = require('./routes/auth'); // Importar las rutas de autenticación
const agregarUsuarioRoutes = require('./routes/usuarioRoutes');
const changePasswordRoutes = require('./routes/changePasswordRoutes');
const clientesRoutes = require('./routes/clientes');
const dbConfig = require('./config/dbConfig'); // Asegúrate de importar tu configuración de DB
const cors = require('cors');
const servicesRoute = require('./routes/servicesRoute');



const app = express();
app.use(cors()); // Middleware de CORS debe estar antes de las rutas
app.use(express.json()); // Middleware para parsear el JSON

app.use('/auth', authRoutes); // Usar las rutas de autenticación
app.use('/usuarios', agregarUsuarioRoutes);

app.use('/api/password', changePasswordRoutes); 
app.use('/usuarios-completo', agregarUsuarioRoutes);
app.use('/api', clientesRoutes); // Rutas de clientes
app.use('/api/servicios', servicesRoute); // Rutas de servicios


// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});


//Mecanico
//carsan@gmail.com
//asdf1234

//Administrador
//admin@example.com
//nueva_contraseña


/* async function crearUsuarios() {
   try {
       const pool = await sql.connect(dbConfig); // Asegúrate de que dbConfig esté definido correctamente
       const hashedPassword = await bcrypt.hash('nueva_contraseña', 10); // Cambia 'nueva_contraseña' según sea necesario

       await pool.request()
           .input('Nombre', sql.NVarChar, 'Admin User')
           .input('Email', sql.NVarChar, 'admin@example.com')
           .input('Contraseña', sql.NVarChar, hashedPassword)
           .input('Rol', sql.NVarChar, 'Administrador')
           .query('INSERT INTO Usuarios (Nombre, Email, Contraseña, Rol) VALUES (@Nombre, @Email, @Contraseña, @Rol)');
<<<<<<< HEAD
=======
=======
 /*async function crearUsuarios() {
   try {
       const pool = await sql.connect(dbConfig); // Asegúrate de que dbConfig esté definido correctamente
       const hashedPassword = await bcrypt.hash('541', 10); // Cambia 'nueva_contraseña' según sea necesario

       await pool.request()
           .input('Nombre', sql.NVarChar, 'Admin User')
           .input('Email', sql.NVarChar, 'admin@gmail.com')
           .input('Contraseña', sql.NVarChar, hashedPassword)
           .input('Rol', sql.NVarChar, 'Administrador')
           .query('INSERT INTO Usuarios (Nombre, Email, Contraseña, Rol) VALUES (@Nombre, @Email, @Contraseña, @Rol)');
>>>>>>> master



 crearUsuarios();*/

