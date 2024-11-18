const sql = require('mssql');
const dbConfig = require('../config/dbConfig');



// Agregar repuesto utilizado
const agregarRepuestoUtilizado = async (req, res) => {
    // Extraemos las claves del JSON y las convertimos a enteros si es necesario
    let { id_cita, id_inventario, cantidad } = req.body;
    
    // Convertir a enteros
    id_cita = parseInt(id_cita);
    id_inventario = parseInt(id_inventario);
    cantidad = parseInt(cantidad);

    // Verificamos si alguna de las conversiones falló
    if (isNaN(id_cita) || isNaN(id_inventario) || isNaN(cantidad)) {
        return res.status(400).json({ message: 'Los datos proporcionados son inválidos' });
    }

    try {
        const pool = await sql.connect(dbConfig);

        // Verificar cantidad disponible en el inventario
        const inventario = await pool.request()
            .input('id_inventario', sql.Int, id_inventario)
            .query('SELECT Cantidad_disponible FROM Inventarios WHERE Id_inventario = @id_inventario');

        if (inventario.recordset.length === 0) {
            return res.status(404).json({ message: 'Inventario no encontrado' });
        }

        const cantidadDisponible = inventario.recordset[0].Cantidad_disponible;
        if (cantidad > cantidadDisponible) { // Usamos 'cantidad' directamente del JSON
            return res.status(400).json({ message: 'Cantidad insuficiente en el inventario' });
        }

        // Insertar repuesto utilizado en la tabla 'Repuesto_Utilizado'
        await pool.request()
            .input('id_cita', sql.Int, id_cita)
            .input('id_inventario', sql.Int, id_inventario)
            .input('cantidad_usada', sql.Int, cantidad)
            .query(`
                INSERT INTO Repuesto_Utilizado (Id_cita, Id_inventario, Cantidad_usada)
                VALUES (@id_cita, @id_inventario, @cantidad_usada)
            `);

        // Actualizar cantidad disponible en la tabla 'Inventarios'
        await pool.request()
            .input('id_inventario', sql.Int, id_inventario)
            .input('cantidad_usada', sql.Int, cantidad)
            .query(`
                UPDATE Inventarios
                SET Cantidad_disponible = Cantidad_disponible - @cantidad_usada
                WHERE Id_inventario = @id_inventario
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

const getRepuestosDisponibles = async (req, res) => {
    try {
        const pool = await sql.connect();
        const query = `
            SELECT 
                i.Id_inventario, 
                r.Id_repuesto, 
                r.Nombre AS nombre_repuesto, 
                i.Cantidad_disponible 
            FROM Inventarios i
            INNER JOIN Repuestos r ON i.Id_repuesto = r.Id_repuesto
            WHERE i.Cantidad_disponible > 0
        `;
        
        const result = await pool.request().query(query);
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'No hay repuestos disponibles' });
        }
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener los repuestos:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    agregarRepuestoUtilizado,
    eliminarRepuestoUtilizado,
    getRepuestosDisponibles
};
