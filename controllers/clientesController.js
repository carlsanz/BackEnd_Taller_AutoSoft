const sql = require('mssql');
const bcrypt = require('bcrypt');
const dbConfig = require('../config/dbConfig');

//Endpoint para obtener los departamentos
const obtenerDepartamentos = async (req, res) => {
    try {
        // Crear una conexión a SQL Server
        const pool = await sql.connect(dbConfig);

        // Ejecutar la consulta para obtener las colonias
        const result = await pool.request().query('SELECT Id_departamento, Nombre FROM Departamentos');
        
        // Devolver el resultado de la consulta
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener departamentos:', error);
        res.status(500).send('Error al obtener los departamentos');
    }
};
// agregar cliente

const agregarCliente = async (req, res) => {
    const { Identidad, Id_colonia, P_nombre, S_nombre, P_apellido, S_apellido, Direccion, Telefono, Fecha_nac, correo, Genero } = req.body;

    try {
        const pool = await sql.connect(dbConfig);

        // Insertar una nueva persona en la tabla Personas
        await pool.request()
            .input('Identidad', sql.NVarChar, Identidad)
            .input('Id_departamento', sql.Int, Id_colonia)
            .input('P_nombre', sql.NVarChar, P_nombre)
            .input('S_nombre', sql.NVarChar, S_nombre || null)
            .input('P_apellido', sql.NVarChar, P_apellido)
            .input('S_apellido', sql.NVarChar, S_apellido || null)
            .input('Direccion', sql.NVarChar, Direccion)
            .input('Telefono', sql.NVarChar, Telefono)
            .input('Fecha_nac', sql.Date, Fecha_nac)
            .input('correo', sql.NVarChar, correo)
            .input('Genero', sql.NVarChar, Genero)
            .query(`
                INSERT INTO Personas (Identidad, Id_departamento, P_nombre, S_nombre, P_apellido, S_apellido, Direccion, Telefono, Fecha_nac, correo, Genero) 
                VALUES (@Identidad, @Id_departamento, @P_nombre, @S_nombre, @P_apellido, @S_apellido, @Direccion, @Telefono, @Fecha_nac, @correo, @Genero)
            `);

        res.status(201).send('Cliente agregado exitosamente');
    } catch (error) {
        console.error('Error al agregar cliente:', error);
        res.status(500).send('Error al agregar el cliente');
    }
};

//buscar clientes por numero de identidad
const buscarClientePorIdentidad = async (req, res) => {
    const { identidad } = req.params;

    try {
        const pool = await sql.connect(dbConfig);

        // Consulta SQL para obtener los datos del cliente y sus datos personales
        const result = await pool.request()
            .input('Identidad', sql.NVarChar, identidad)
            .query(`
                SELECT Clientes.Id_cliente, Personas.*
                FROM Clientes
                INNER JOIN Personas ON Clientes.Identidad = Personas.Identidad
                WHERE Clientes.Identidad = @Identidad
            `);

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);  // Devuelve los datos del cliente encontrado
        } else {
            res.status(404).json({ message: 'Cliente no encontrado' });
        }
    } catch (error) {
        console.error('Error al buscar cliente:', error);
        res.status(500).send('Error al buscar el cliente');
    }
};

// funcion para actualizar cliente 
const actualizarCliente = async (req, res) => {
    const { identidad } = req.params;
    const { Id_colonia, P_nombre, S_nombre, P_apellido, S_apellido, Direccion, Telefono, Fecha_nac, correo, Genero } = req.body;

    try {
        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('Identidad', sql.NVarChar, identidad)
            .input('Id_departamento', sql.Int, Id_departamento)
            .input('P_nombre', sql.NVarChar, P_nombre)
            .input('S_nombre', sql.NVarChar, S_nombre || null)
            .input('P_apellido', sql.NVarChar, P_apellido)
            .input('S_apellido', sql.NVarChar, S_apellido || null)
            .input('Direccion', sql.NVarChar, Direccion)
            .input('Telefono', sql.NVarChar, Telefono)
            .input('Fecha_nac', sql.Date, Fecha_nac)
            .input('correo', sql.NVarChar, correo)
            .input('Genero', sql.NVarChar, Genero)
            .query(`
                UPDATE Personas SET
                    Id_departamento = @Id_departamento,
                    P_nombre = @P_nombre,
                    S_nombre = @S_nombre,
                    P_apellido = @P_apellido,
                    S_apellido = @S_apellido,
                    Direccion = @Direccion,
                    Telefono = @Telefono,
                    Fecha_nac = @Fecha_nac,
                    correo = @correo,
                    Genero = @Genero
                WHERE Identidad = @Identidad
            `);

        res.status(200).send('Cliente actualizado correctamente');
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).send('Error al actualizar el cliente');
    }
};
//funcion para eliminar cliente 
const eliminarCliente = async (req, res) => {
    const { identidad } = req.params;

    try {
        const pool = await sql.connect(dbConfig);

        // Eliminar el cliente de la tabla Clientes usando Identidad
        await pool.request()
            .input('Identidad', sql.NVarChar, identidad)
            .query('DELETE FROM Clientes WHERE Identidad = @Identidad');

        // No es necesario eliminar de la tabla Personas ya que existe un trigger que se encargará de eso

        res.status(200).send('Cliente eliminado correctamente');
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).send('Error al eliminar el cliente');
    }
};
module.exports = { obtenerDepartamentos, agregarCliente, buscarClientePorIdentidad, actualizarCliente, eliminarCliente };