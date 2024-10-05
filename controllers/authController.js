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

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            const isMatch = await bcrypt.compare(password, user.Contraseña);
            if (isMatch) {
                return res.status(200).json({ message: 'Login exitoso', role: user.Rol }); // Asegúrate de que "Rol" es correcto
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
};

// Exportar el controlador
module.exports = { login };