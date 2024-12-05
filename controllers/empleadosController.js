const sql = require('mssql'); // Biblioteca para interactuar con SQL Server
const dbConfig = require('../config/dbConfig'); // Asegúrate de tener configurada tu conexión

// Controlador para gestionar empleados
const empleadosController = {};


// Eliminar un empleado y sus registros relacionados
empleadosController.eliminarEmpleado = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

    const { id } = req.params; // Id_empleados

    // Recuperar la Identidad y correo antes de eliminar
    const result = await pool.request()
      .input('Id_empleados', sql.Int, id)
      .query(`
        SELECT e.Identidad, u.Email
        FROM Empleados e
        JOIN Usuarios u ON e.Id_usuario = u.Id_usuario
        WHERE e.Id_empleados = @Id_empleados
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const { Identidad, Email } = result.recordset[0];

    // Eliminar de la tabla Empleados
    await pool.request()
      .input('Id_empleados', sql.Int, id)
      .query(`DELETE FROM Empleados WHERE Id_empleados = @Id_empleados`);

    // Eliminar de la tabla Usuarios
    await pool.request()
      .input('Email', sql.NVarChar, Email)
      .query(`DELETE FROM Usuarios WHERE Email = @Email`);

    // Eliminar de la tabla Personas
    await pool.request()
      .input('Identidad', sql.NVarChar, Identidad)
      .query(`DELETE FROM Personas WHERE Identidad = @Identidad`);

    res.status(200).json({ message: 'Empleado eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el empleado:', error);
    res.status(500).json({ error: 'Error al eliminar el empleado' });
  }
};

/********************************************************************** */

empleadosController.recuperarYEditarEmpleado = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const { id } = req.params;

    // Recuperar los datos actuales del empleado
    const result = await pool.request()
      .input('Id_empleados', sql.Int, id)
      .query(`
        SELECT Id_empleados, Identidad, Ocupacion, Salario, Fecha_contratacion, Id_usuario
        FROM Empleados
        WHERE Id_empleados = @Id_empleados
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Si el método es GET, devolver los datos del empleado
    if (req.method === 'GET') {
      return res.status(200).json(result.recordset[0]);
    }

    // Si el método es PUT, actualizar los datos del empleado
    const { Identidad, Ocupacion, Salario, Fecha_contratacion, Id_usuario } = req.body;

    await pool.request()
      .input('Id_empleados', sql.Int, id)
      .input('Identidad', sql.NVarChar, Identidad)
      .input('Ocupacion', sql.NVarChar, Ocupacion)
      .input('Salario', sql.Float, Salario)
      .input('Fecha_contratacion', sql.Date, Fecha_contratacion)
      .input('Id_usuario', sql.Int, Id_usuario)
      .query(`
        UPDATE Empleados
        SET Identidad = @Identidad,
            Ocupacion = @Ocupacion,
            Salario = @Salario,
            Fecha_contratacion = @Fecha_contratacion,
            Id_usuario = @Id_usuario
        WHERE Id_empleados = @Id_empleados
      `);

    res.status(200).json({ message: 'Empleado actualizado exitosamente' });
  } catch (error) {
    console.error('Error al recuperar o editar el empleado:', error);
    res.status(500).json({ error: 'Error al recuperar o editar el empleado' });
  }
};

/***************************************************************** */
module.exports = empleadosController;
