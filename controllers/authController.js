const sql = require('mssql');
const bcrypt = require('bcrypt');
const dbConfig = require('../config/dbConfig');

// Controlador para el login
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Usuarios WHERE Email = @email');

        // Verificar si el usuario existe
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const user = result.recordset[0];

        // Verificar si la contraseña coincide
        const isMatch = await bcrypt.compare(password, user.Contraseña);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Convertir 'Primer_ingreso' a booleano si viene como 0 o 1
        const primerIngreso = user.Primer_ingreso === 1;

        // Respuesta al frontend con los datos necesarios
        return res.status(200).json({
            message: 'Login exitoso',
            nombre: user.Nombre,
            role: user.Rol,
            primerIngreso
        });

    } catch (error) {
        console.error('Error en el servidor:', error);
        return res.status(500).json({ message: 'Error del servidor' });
    } finally {
        // Asegurarse de liberar la conexión
        sql.close();
    }
};

module.exports = { login };


