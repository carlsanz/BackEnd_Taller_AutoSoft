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


  const eliminarServicio = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Id_repuesto', sql.Int, id)
            .query('DELETE FROM Servicios WHERE Id_servicio = @Id_servicio');
        res.json({ mensaje: 'Servicio eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
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


  const obtenerServiciosPorCita = async (req, res) => {
    const { id_cita } = req.params;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id_cita', sql.Int, id_cita)
            .query(`
                SELECT 
                    CS.id_servicio,
                    S.Nombre AS nombre_servicio,
                    S.Precio AS precio_servicio
                FROM Citas_Servicios CS
                INNER JOIN Servicios S ON CS.id_servicio = S.id_servicio
                WHERE CS.id_cita = @id_cita
            `);

        if (result.recordset.length === 0) {
            return res.status(200).json([]); // Devuelve un array vacío
        }

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error al obtener los servicios:', error);
        res.status(500).json({ message: 'Error del servidor al obtener los servicios.' });
    }
};


const eliminarServicioDeCita = async (req, res) => {
  const { id_cita, id_servicio } = req.params;
  

  try {
      // Verificar que los parámetros son válidos
      if (isNaN(id_cita) || isNaN(id_servicio)) {
          return res.status(400).json({ message: 'ID de cita o servicio inválido.' });
      }

      const pool = await sql.connect(dbConfig);

      // Ejecutar la consulta para eliminar el servicio
      const result = await pool.request()
          .input('id_cita', sql.Int, id_cita)
          .input('id_servicio', sql.Int, id_servicio)
          .query(`
              DELETE FROM Citas_Servicios
              WHERE id_cita = @id_cita AND id_servicio = @id_servicio
          `);

      // Comprobar si se eliminó algún registro
      if (result.rowsAffected[0] === 0) {
          console.log('No se encontró el servicio asociado a esta cita.');
          return res.status(404).json({ message: 'Servicio no encontrado para esta cita.' });
      }

      
      res.status(200).json({ message: 'Servicio eliminado correctamente de la cita.' });

  } catch (error) {
      console.error('Error al eliminar el servicio:', error.message);
      res.status(500).json({
          message: 'Error del servidor al eliminar el servicio.',
          error: error.message
      });
  }
};

module.exports = { obtenerServicios, eliminarServicio, agregarServicio,  actualizarServicio, obtenerServiciosXcita, asociarServicioConCita, obtenerServiciosPorCita, eliminarServicioDeCita };

