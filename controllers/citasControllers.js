const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

// Crear una nueva cita
const crearCita = async (req, res) => {
    const { Id_cliente, Id_empleados, Id_auto, Fecha_ingreso, Descripcion, Id_estado } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Id_cliente', sql.Int, Id_cliente)
            .input('Id_empleados', sql.Int, Id_empleados)
            .input('Id_auto', sql.Int, Id_auto)
            .input('Fecha_ingreso', sql.DateTime, Fecha_ingreso)
            .input('Descripcion', sql.VarChar, Descripcion)
            .input('Id_estado', sql.Int, Id_estado)
            .query('INSERT INTO Citas (Id_cliente, Id_empleados, Id_auto, Fecha_ingreso, Descripcion, Id_estado) VALUES (@Id_cliente, @Id_empleados, @Id_auto, @Fecha_ingreso, @Descripcion, @Id_estado)');
        res.status(201).json({ mensaje: 'Cita creada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todas las citas
const obtenerCitas = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Citas');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener una cita por ID
const obtenerCitaPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('Id_cita', sql.Int, id)
            .query('SELECT * FROM Citas WHERE Id_cita = @Id_cita');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ mensaje: 'Cita no encontrada' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar una cita
const actualizarCita = async (req, res) => {
    const { id } = req.params;
    const { Id_cliente, Id_empleados, Id_auto, Fecha_ingreso, Descripcion, Id_estado } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Id_cliente', sql.Int, Id_cliente)
            .input('Id_empleados', sql.Int, Id_empleados)
            .input('Id_auto', sql.Int, Id_auto)
            .input('Fecha_ingreso', sql.DateTime, Fecha_ingreso)
            .input('Descripcion', sql.VarChar, Descripcion)
            .input('Id_estado', sql.Int, Id_estado)
            .input('Id_cita', sql.Int, id)
            .query('UPDATE Citas SET Id_cliente = @Id_cliente, Id_empleados = @Id_empleados, Id_auto = @Id_auto, Fecha_ingreso = @Fecha_ingreso, Descripcion = @Descripcion, Id_estado = @Id_estado WHERE Id_cita = @Id_cita');
        res.json({ mensaje: 'Cita actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar una cita
const eliminarCita = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Id_cita', sql.Int, id)
            .query('DELETE FROM Citas WHERE Id_cita = @Id_cita');
        res.json({ mensaje: 'Cita eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    crearCita,
    obtenerCitas,
    obtenerCitaPorId,
    actualizarCita,
    eliminarCita
};
