const sql = require('mssql');
const dbConfig = require('../config/dbConfig');


const obtenerServicios = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const resultado = await pool.request().query('SELECT Id_servicio, Nombre, Descripcion, Precio, Tipo_servicio FROM Servicios');

        res.status(200).json(resultado.recordset);
    } catch (error) {
        console.error('Error al obtener los servicios:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

//Agregar Servicio
const agregarServicio = async (req, res) => {
    const { Nombre, Descripcion, Precio, Tipo_servicio } = req.body;

    if (!Nombre || !Descripcion || !Precio || !Tipo_servicio) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('Nombre', sql.NVarChar, Nombre)
            .input('Descripcion', sql.NVarChar, Descripcion)
            .input('Precio', sql.Decimal, Precio)
            .input('Tipo_servicio', sql.NVarChar, Tipo_servicio)
            .query('INSERT INTO Servicios (Nombre, Descripcion, Precio, Tipo_servicio) VALUES (@Nombre, @Descripcion, @Precio, @Tipo_servicio); SELECT SCOPE_IDENTITY() AS Id_servicio');

        const nuevoServicio = {
            Id_servicio: result.recordset[0].Id_servicio,
            Nombre,
            Descripcion,
            Precio,
            Tipo_servicio
        };

        res.status(201).json(nuevoServicio);
    } catch (error) {
        console.error('Error al agregar el servicio:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Controlador para borrar un servicio
const borrarServicio = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('Id_servicio', sql.Int, id)
            .query('DELETE FROM Servicios WHERE Id_servicio = @Id_servicio');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        res.status(200).json({ message: 'Servicio borrado exitosamente' });
    } catch (error) {
        console.error('Error al borrar el servicio:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

const actualizarServicio = async (req, res) => {
    const { id } = req.params;
    const { Nombre, Descripcion, Precio, Tipo_servicio } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('Id_servicio', sql.Int, id)
            .input('Nombre', sql.NVarChar, Nombre)
            .input('Descripcion', sql.NVarChar, Descripcion)
            .input('Precio', sql.Decimal, Precio)
            .input('Tipo_servicio', sql.NVarChar, Tipo_servicio)
            .query('UPDATE Servicios SET Nombre = @Nombre, Descripcion = @Descripcion, Precio = @Precio, Tipo_servicio = @Tipo_servicio WHERE Id_servicio = @Id_servicio');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        res.status(200).json({ Id_servicio: id, Nombre, Descripcion, Precio, Tipo_servicio });
    } catch (error) {
        console.error('Error al actualizar el servicio:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

module.exports = { obtenerServicios, agregarServicio, borrarServicio, actualizarServicio  };

