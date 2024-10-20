const sql = require('mssql');
const bcrypt = require('bcrypt');
const dbConfig = require('../config/dbConfig'); 

// Cambiar contraseña por el administrador
exports.adminChangePassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const pool = await sql.connect(dbConfig);

        
 
        // Realizar la actualización
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .input('newPassword', sql.VarChar, hashedPassword)
            .query('UPDATE Usuarios SET Contraseña = @newPassword WHERE Email = @email AND Rol = \'Mecanico\'');

        // Verifica cuántas filas fueron afectadas
        console.log('Rows affected:', result.rowsAffected);

        if (result.rowsAffected[0] > 0) {
            res.status(200).json({ message: 'Contraseña actualizada con éxito' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado o no tiene el rol de Mecanico' });
        }
    } catch (error) {
        console.error('Error al actualizar la contraseña:', error);
        res.status(500).json({ message: 'Error al actualizar la contraseña', error });
    }
};
// Cambiar contraseña por el mecánico
exports.mecanicoChangePassword = async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT Contraseña FROM Usuarios WHERE Email = @email AND Rol = \'Mecanico\'');

        if (result.recordset.length > 0) {
            const match = await bcrypt.compare(oldPassword, result.recordset[0].Contraseña);
            if (!match) {
                return res.status(400).json({ message: 'Contraseña anterior incorrecta' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await pool.request()
                .input('email', sql.VarChar, email)
                .input('newPassword', sql.VarChar, hashedPassword)
                .query('UPDATE Usuarios SET Contraseña = @newPassword WHERE Email = @email');

            res.status(200).json({ message: 'Contraseña actualizada con éxito' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la contraseña', error });
    }
};