const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

// Obtener todos los repuestos
const obtenerRepuestos = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Repuestos');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear un nuevo repuesto
const crearRepuesto = async (req, res) => {
    const { Nombre, Id_marca_repuesto, Id_proveedor, Descripcion, Precio } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Nombre', sql.VarChar, Nombre)
            .input('Id_marca_repuesto', sql.Int, Id_marca_repuesto)
            .input('Id_proveedor', sql.Int, Id_proveedor)
            .input('Descripcion', sql.VarChar, Descripcion)
            .input('Precio', sql.Decimal(10, 2), Precio)
            .query('INSERT INTO Repuestos (Nombre, Id_marca_repuesto, Id_proveedor, Descripcion, Precio) VALUES (@Nombre, @Id_marca_repuesto, @Id_proveedor, @Descripcion, @Precio)');
        res.status(201).json({ mensaje: 'Repuesto creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un repuesto
const actualizarRepuesto = async (req, res) => {
    const { id } = req.params;
    const { Nombre, Id_marca_repuesto, Id_proveedor, Descripcion, Precio } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Nombre', sql.VarChar, Nombre)
            .input('Id_marca_repuesto', sql.Int, Id_marca_repuesto)
            .input('Id_proveedor', sql.Int, Id_proveedor)
            .input('Descripcion', sql.VarChar, Descripcion)
            .input('Precio', sql.Decimal(10, 2), Precio)
            .input('Id_repuesto', sql.Int, id)
            .query('UPDATE Repuestos SET Nombre = @Nombre, Id_marca_repuesto = @Id_marca_repuesto, Id_proveedor = @Id_proveedor, Descripcion = @Descripcion, Precio = @Precio WHERE Id_repuesto = @Id_repuesto');
        res.json({ mensaje: 'Repuesto actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un repuesto
const eliminarRepuesto = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Id_repuesto', sql.Int, id)
            .query('DELETE FROM Repuestos WHERE Id_repuesto = @Id_repuesto');
        res.json({ mensaje: 'Repuesto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Buscar un repuesto por nombre
const buscarRepuestoPorNombre = async (req, res) => {
    const { nombre } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('Nombre', sql.VarChar, `%${nombre}%`)
            .query('SELECT * FROM Repuestos WHERE Nombre LIKE @Nombre');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener lista de proveedores
const obtenerProveedores = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT Id_proveedor, Nombre FROM Proveedores');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener lista de marcas de repuestos
const obtenerMarcasRepuestos = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT Id_marca_repuesto, Nombre FROM Marca_repuestos');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerRepuestos,
    crearRepuesto,
    actualizarRepuesto,
    eliminarRepuesto,
    buscarRepuestoPorNombre,
    obtenerProveedores,
    obtenerMarcasRepuestos
};
