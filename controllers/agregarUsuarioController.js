const sql = require('mssql');

// Controlador para agregar un nuevo usuario solo permitido agregar a administradores
const agregarUsuario = async (req, res) => {
    const { nombre, email, contraseña } = req.body;
    const rol = 'Mecanico'; // Rol fijo

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Nombre', sql.VarChar, nombre)
            .input('Email', sql.VarChar, email)
            .input('Contraseña', sql.VarChar, contraseña)
            .input('Rol', sql.VarChar, rol)
            .query('INSERT INTO Usuarios (Nombre, Email, Contraseña, Rol) VALUES (@Nombre, @Email, @Contraseña, @Rol)');

        res.status(201).json({ message: 'Usuario agregado exitosamente' });
    } catch (error) {
        console.error('Error al agregar usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

module.exports = { agregarUsuario };