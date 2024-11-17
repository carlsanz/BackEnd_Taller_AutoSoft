const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

// Agregar repuesto utilizado
const agregarRepuestoUtilizado = async (req, res) => {
    const { Id_cita, Id_inventario, Cantidad_usada } = req.body;

    try {
        const pool = await sql.connect(dbConfig);

        // Verificar cantidad disponible en el inventario
        const inventario = await pool.request()
            .input('Id_inventario', sql.Int, Id_inventario)
            .query('SELECT Cantidad_disponible FROM Inventario WHERE Id_inventario = @Id_inventario');

        if (inventario.recordset.length === 0) {
            return res.status(404).json({ message: 'Inventario no encontrado' });
        }

        const cantidadDisponible = inventario.recordset[0].Cantidad_disponible;
        if (Cantidad_usada > cantidadDisponible) {
            return res.status(400).json({ message: 'Cantidad insuficiente en el inventario' });
        }

        // Insertar repuesto utilizado
        await pool.request()
            .input('Id_cita', sql.Int, Id_cita)
            .input('Id_inventario', sql.Int, Id_inventario)
            .input('Cantidad_usada', sql.Int, Cantidad_usada)
            .query(`
                INSERT INTO Repuesto_Utilizado (Id_cita, Id_inventario, Cantidad_usada)
                VALUES (@Id_cita, @Id_inventario, @Cantidad_usada)
            `);

        // Actualizar cantidad en inventario
        await pool.request()
            .input('Id_inventario', sql.Int, Id_inventario)
            .input('Cantidad_usada', sql.Int, Cantidad_usada)
            .query(`
                UPDATE Inventario
                SET Cantidad_disponible = Cantidad_disponible - @Cantidad_usada
                WHERE Id_inventario = @Id_inventario
            `);

        res.status(201).json({ message: 'Repuesto utilizado agregado correctamente' });
    } catch (error) {
        console.error('Error al agregar el repuesto utilizado:', error);
        res.status(500).json({ message: 'Error al agregar el repuesto utilizado' });
    }
};

// Eliminar repuesto utilizado
const eliminarRepuestoUtilizado = async (req, res) => {
    const { id } = req.params; // Id_repuesto_utilizado

    try {
        const pool = await sql.connect(dbConfig);

        // Obtener detalles del repuesto y la cita asociada
        const repuesto = await pool.request()
            .input('Id_repuesto_utilizado', sql.Int, id)
            .query(`
                SELECT RU.Id_inventario, RU.Cantidad_usada, C.Id_estado
                FROM Repuesto_Utilizado RU
                INNER JOIN Citas C ON RU.Id_cita = C.Id_cita
                WHERE RU.Id_repuesto_utilizado = @Id_repuesto_utilizado
            `);

        if (repuesto.recordset.length === 0) {
            return res.status(404).json({ message: 'Repuesto utilizado no encontrado' });
        }

        const { Id_inventario, Cantidad_usada, Id_estado } = repuesto.recordset[0];

        // Si el estado es "Pendiente" o "En Proceso", devolver cantidad al inventario
        if (Id_estado === 1 || Id_estado === 2) { // Asumiendo 1=Pendiente, 2=En Proceso
            await pool.request()
                .input('Id_inventario', sql.Int, Id_inventario)
                .input('Cantidad_usada', sql.Int, Cantidad_usada)
                .query(`
                    UPDATE Inventario
                    SET Cantidad_disponible = Cantidad_disponible + @Cantidad_usada
                    WHERE Id_inventario = @Id_inventario
                `);
        }

        // Eliminar repuesto utilizado
        await pool.request()
            .input('Id_repuesto_utilizado', sql.Int, id)
            .query('DELETE FROM Repuesto_Utilizado WHERE Id_repuesto_utilizado = @Id_repuesto_utilizado');

        res.status(200).json({ message: 'Repuesto utilizado eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el repuesto utilizado:', error);
        res.status(500).json({ message: 'Error al eliminar el repuesto utilizado' });
    }
};

module.exports = {
    agregarRepuestoUtilizado,
    eliminarRepuestoUtilizado,
};
