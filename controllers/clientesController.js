const sql = require('mssql');
const bcrypt = require('bcrypt');
const dbConfig = require('../config/dbConfig');


//Obtener todos los clientes
const obtenerTodosLosClientes = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        // Consulta SQL para obtener los campos especificados de los clientes
        const result = await pool.request()
            .query(`
                SELECT 
                    Personas.Identidad, 
                    Personas.P_nombre, 
                    Personas.P_apellido, 
                    Personas.Genero, 
                    Personas.Direccion
                FROM Clientes
                INNER JOIN Personas ON Clientes.Identidad = Personas.Identidad
            `);

        if (result.recordset.length > 0) {
            res.json(result.recordset);  // Devuelve los datos de los clientes
        } else {
            res.status(404).json({ message: 'No se encontraron clientes' });
        }
    } catch (error) {
        console.error('Error al obtener los clientes:', error);
        res.status(500).send('Error al obtener los clientes');
    }
};



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

// Endpoint para obtener los clientes
const obtenerClientes = async (req, res) => {
    try {
        // Crear una conexión a SQL Server
        const pool = await sql.connect(dbConfig);

        // Ejecutar la consulta para obtener los clientes  
        const result = await pool.request()
            .query(`
                SELECT 
                    p.Identidad, 
                    p.Id_departamento, 
                    p.P_nombre, 
                    p.S_nombre, 
                    p.P_apellido, 
                    p.S_apellido, 
                    p.Direccion, 
                    p.Telefono, 
                    p.Fecha_nac, 
                    p.correo, 
                    p.Genero
                FROM 
                    Clientes 
                INNER JOIN 
                    Personas p 
                ON 
                    Clientes.Identidad = p.Identidad
            `);

        // Devolver el resultado de la consulta
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener clientes:', error.message);
        res.status(500).send('Error al obtener los clientes');
    }
};
// agregar cliente

const agregarCliente = async (req, res) => {
    const { Identidad, Id_departamento, P_nombre, S_nombre, P_apellido, S_apellido, Direccion, Telefono, Fecha_nac, correo, Genero } = req.body;

    try {
        const pool = await sql.connect(dbConfig);

        // Iniciar una transacción para asegurar la consistencia de ambas inserciones
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Insertar una nueva persona en la tabla Personas
            await transaction.request()
                .input('Identidad', sql.NVarChar, Identidad)
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
                    INSERT INTO Personas (Identidad, Id_departamento, P_nombre, S_nombre, P_apellido, S_apellido, Direccion, Telefono, Fecha_nac, correo, Genero) 
                    VALUES (@Identidad, @Id_departamento, @P_nombre, @S_nombre, @P_apellido, @S_apellido, @Direccion, @Telefono, @Fecha_nac, @correo, @Genero)
                `);

            // Insertar el cliente en la tabla Clientes, tomando la identidad insertada en Personas
            await transaction.request()
                .input('Identidad', sql.NVarChar, Identidad)
                .query(`
                    INSERT INTO Clientes (Identidad) 
                    VALUES (@Identidad)
                `);

            // Confirmar ambas inserciones si no hay errores
            await transaction.commit();

            res.status(201).send('Cliente agregado exitosamente');
        } catch (error) {
            // Si hay un error, deshacer ambas inserciones
            await transaction.rollback();
            console.error('Error al agregar cliente:', error);
            res.status(500).send('Error al agregar el cliente');
        }

    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        res.status(500).send('Error en la conexión a la base de datos');
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
    const { Id_departamento, P_nombre, S_nombre, P_apellido, S_apellido, Direccion, Telefono, Fecha_nac, correo, Genero } = req.body;

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

//Obteber empleado por id de empleado
const ObtenerEmpleadosId= async(req, res)=>
{
    const { idEmpleado } = req.params;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('select * from Empleados');
    
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener citas.');
    }
}


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
module.exports = { ObtenerEmpleadosId, 
                obtenerDepartamentos, 
                agregarCliente, 
                buscarClientePorIdentidad, 
                actualizarCliente, 
                eliminarCliente, 
                obtenerTodosLosClientes,
                obtenerClientes };