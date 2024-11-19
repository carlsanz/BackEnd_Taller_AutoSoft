const sql = require('mssql');
const dbConfig = require('../config/dbConfig');


const obtenerServiciosXcita = async (req, res) => {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query('SELECT * FROM Servicios'); // Cambia la consulta si necesitas filtrar datos
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      res.status(500).send('Error al obtener los servicios');
    }
  };


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

const asociarServicioConCita = async (req, res) => {
    const { id_cita, id_servicio } = req.body;
  
    if (!id_cita || !id_servicio) {
      return res.status(400).json({ message: 'Faltan los parámetros id_cita o id_servicio' });
    }
  
    try {
      // Conectarse a la base de datos
      const pool = await sql.connect(dbConfig);
  
      // Verificar si el servicio ya está asociado con la cita
      const existingService = await pool.request()
        .input('id_cita', sql.Int, id_cita)
        .input('id_servicio', sql.Int, id_servicio)
        .query('SELECT COUNT(*) AS count FROM Citas_Servicios WHERE id_cita = @id_cita AND id_servicio = @id_servicio');
  
      if (existingService.recordset[0].count > 0) {
        // Si ya existe, devolver un mensaje indicando que no se puede insertar de nuevo
        return res.status(400).json({ message: 'Este servicio ya está asociado con la cita.' });
      }
  
      // Realizar la inserción en la tabla Citas_Servicios
      const query = `
        INSERT INTO Citas_Servicios (id_cita, id_servicio)
        VALUES (@id_cita, @id_servicio);
      `;
  
      await pool.request()
        .input('id_cita', sql.Int, id_cita)
        .input('id_servicio', sql.Int, id_servicio)
        .query(query);
  
      res.status(201).json({ message: 'Servicio asociado a la cita correctamente' });
  
    } catch (error) {
      console.error('Error al asociar el servicio con la cita:', error);
      res.status(500).json({ message: 'Error del servidor' });
    }
  };

module.exports = { obtenerServicios, agregarServicio, borrarServicio, actualizarServicio, obtenerServiciosXcita, asociarServicioConCita };

