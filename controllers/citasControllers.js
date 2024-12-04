const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

const buscarAutoPorPlaca = async (req, res) => {
    const { placa } = req.params; // Recibe la placa del parámetro de la URL

    try {
        const pool = await sql.connect(dbConfig); // Conexión a la base de datos
        const result = await pool.request()
            .input('Placa', sql.VarChar, placa) // Asigna el valor de placa como parámetro
            .query(`
                SELECT Autos.Id_auto, Clientes.Id_cliente 
                FROM Autos
                INNER JOIN Clientes ON Autos.Identidad = Clientes.Identidad
                WHERE Autos.Placa = @Placa;
            `); // Consulta SQL con el parámetro @Placa

        if (result.recordset.length > 0) {
            // Si se encuentran resultados, devuelve el primer resultado
            res.json(result.recordset[0]);
        } else {
            // Si no se encuentran resultados
            res.status(404).json({ mensaje: 'Automóvil no encontrado' });
        }
    } catch (error) {
        // Manejo de errores
        res.status(500).json({ error: error.message });
    }
};
// Obtener lista de estados
const obtenerEstados = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT Id_estado, Nombre FROM Estados_citas');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




const obtenerClientesYplaca = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const cientesResult = await pool.request()
            .query("SELECT Identidad FROM Clientes");

            const personaResult = await pool.request()
            .query("SELECT Personas.P_nombre, Personas.P_apellido, FROM Personas ");
        
            const autoResult = await pool.request()
            .query("SELECT Placa, Id_modelo, Id_tipo, Id_color FROM Autos");
        
            res.json({
            Nombre: personaResult.recordset,
            cliente:cientesResult.recordset,
            placa: autoResult.recordset

        })
    } catch (error) {
        console.error('Error al obtener los clientes y autos:', error);
        res.status(500).send('Error al obtener los clientes');
    }
};

const obtenerCitas = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().
        query(`SELECT 
                c.Id_cita,
                c.Fecha_ingreso AS Fecha,
                c.Descripcion AS Descripcion,
                a.Placa AS Placa,
                cli.P_nombre AS Nombre_Cliente,
                emp.P_nombre AS Nombre_Empleado,
                ec.Nombre AS Estado
                    FROM 
                        Citas c
                    LEFT JOIN 
                        Autos a ON c.Id_auto = a.Id_auto
                    LEFT JOIN 
                        Clientes cl ON c.Id_cliente = cl.Id_cliente
                    LEFT JOIN 
                        Personas cli ON cl.Identidad = cli.Identidad
                    LEFT JOIN 
                        Empleados e ON c.Id_empleados = e.Id_empleados
                    LEFT JOIN 
                        Personas emp ON e.Identidad = emp.Identidad
                    LEFT JOIN 
                        Estados_Citas ec ON c.Id_estado = ec.Id_estado;`);
        res.json(result.recordset);
    } catch (error) {
        console.error("Error al obtener la cita:", error);
        res.status(500).json({ message: "Error al obtener el Citas" });
    }
};

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
            .query(`
                INSERT INTO Citas (Id_cliente, Id_empleados, Id_auto, Fecha_ingreso, Descripcion, Id_estado)
                VALUES (@Id_cliente, @Id_empleados, @Id_auto, @Fecha_ingreso, @Descripcion, @Id_estado)
            `);
        res.status(201).json({ mensaje: 'Cita creada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todas las citas

// Obtener una cita por ID
const obtenerCitasPorMecanico = async (req, res) => {
    const { nombre } = req.params; // Capturamos el nombre como parámetro en la URL
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('NombreEmpleado', sql.NVarChar, `%${nombre}%`) // Usamos LIKE con patrones
            .query(`
                SELECT 
                    c.Id_cita,
                    c.Fecha_ingreso AS Fecha,
                    c.Descripcion AS Descripcion,
                    a.Placa AS Placa,
                    cli.P_nombre AS Nombre_Cliente,
                    emp.P_nombre AS Nombre_Empleado,
                    ec.Nombre AS Estado
                FROM 
                    Citas c
                LEFT JOIN 
                    Autos a ON c.Id_auto = a.Id_auto
                LEFT JOIN 
                    Clientes cl ON c.Id_cliente = cl.Id_cliente
                LEFT JOIN 
                    Personas cli ON cl.Identidad = cli.Identidad
                LEFT JOIN 
                    Empleados e ON c.Id_empleados = e.Id_empleados
                LEFT JOIN 
                    Personas emp ON e.Identidad = emp.Identidad
                LEFT JOIN 
                    Estados_Citas ec ON c.Id_estado = ec.Id_estado
                WHERE 
                    emp.P_nombre LIKE @NombreEmpleado
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron citas para el mecánico especificado.' });
        }

        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


const obtenerCitasporEmpleado = async (req, res) => {
    const { idEmpleado } = req.params; // Extrae directamente el ID del empleado

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('Id_empleados', sql.Int, idEmpleado) // Asegúrate de que Id_empleados sea un entero válido
            .query(`
                SELECT 
                    c.Id_cita, c.Id_cliente, c.Id_empleados, c.Fecha_ingreso, 
                    c.Descripcion, c.Id_estado, ec.Nombre AS estado,
                    a.Placa AS placa, p.P_nombre AS Nombre 
                FROM Citas c
                JOIN Autos a ON c.Id_auto = a.Id_auto
                JOIN Clientes cl ON c.Id_cliente = cl.Id_cliente
                JOIN Personas p ON cl.Identidad = p.Identidad
                JOIN Estados_Citas ec ON c.Id_estado = ec.Id_estado
                WHERE c.Id_empleados = @Id_empleados
            `); // Filtra por el empleado correspondiente

        // Si no hay citas, devuelve un array vacío con un 200
        if (result.recordset.length === 0) {
            return res.status(200).json([]); // Devuelve un array vacío
        }

        res.status(200).json(result.recordset); // Devuelve las citas encontradas
    } catch (error) {
        console.error('Error al obtener las citas:', error);
        res.status(500).json({ message: 'Error del servidor al obtener las citas.' });
    }
};

const obtenerCitasPorFecha = async (req, res) => {
    const { fecha } = req.params; // Extrae la fecha de los parámetros

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('Fecha_ingreso', sql.Date, fecha) // Asegúrate de que la fecha sea válida
            .query(`
                SELECT 
                    c.Id_cita, c.Id_cliente, c.Id_empleados, c.Fecha_ingreso, 
                    c.Descripcion, c.Id_estado, ec.Nombre AS estado,
                    a.Placa AS placa, p.P_nombre AS Nombre 
                FROM Citas c
                JOIN Autos a ON c.Id_auto = a.Id_auto
                JOIN Clientes cl ON c.Id_cliente = cl.Id_cliente
                JOIN Personas p ON cl.Identidad = p.Identidad
                JOIN Estados_Citas ec ON c.Id_estado = ec.Id_estado
                WHERE c.Fecha_ingreso = @Fecha_ingreso
            `); // Filtra por la fecha de ingreso

        // Si no hay citas, devuelve un array vacío con un 200
        if (result.recordset.length === 0) {
            return res.status(200).json([]); // Devuelve un array vacío
        }

        res.status(200).json(result.recordset); // Devuelve las citas encontradas
    } catch (error) {
        console.error('Error al obtener las citas por fecha:', error);
        res.status(500).json({ message: 'Error del servidor al obtener las citas.' });
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

// Actualizar una cita
const actualizarFechaCita = async (req, res) => {
    const { id } = req.params;
    const { Fecha_ingreso } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Fecha_ingreso', sql.DateTime, Fecha_ingreso)
            .input('Id_cita', sql.Int, id)
            .query('UPDATE Citas SET Fecha_ingreso = @Fecha_ingreso WHERE Id_cita = @Id_cita');
        res.json({ mensaje: 'Cita actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Actualizar un estado de una cita

const actualizarEstadoCita = async (req, res) => {
    const { id } = req.params;
    const {  Id_estado } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Id_estado', sql.Int, Id_estado)
            .input('Id_cita', sql.Int, id)
            .query('UPDATE Citas SET  Id_estado = @Id_estado WHERE Id_cita = @Id_cita');
        res.json({ mensaje: 'Cita actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// obtener el listado de los estados con su id cita
const obtenerEstadosCitas = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT Id_cita, Id_estado from Citas');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Eliminar una cita
const eliminarCita = async (req, res) => {
    const { id } = req.params;
    try {
        console.log('Eliminando cita con Id_cita:', id);
        
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('Id_cita', sql.Int, id)
            .query('DELETE FROM Citas WHERE Id_cita = @Id_cita');
        
        console.log('Resultado del DELETE:', result); // Agrega este log
        
        if (result.rowsAffected[0] > 0) {
            res.json({ mensaje: 'Cita eliminada exitosamente' });
        } else {
            res.status(404).json({ error: 'Cita no encontrada' });
        }
    } catch (error) {
        console.error('Error al eliminar la cita:', error.message); // Log de errores
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

/*const ObtenerCitasHoy= async (req, res) => {
    try {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const query = `
            SELECT * FROM Citas 
            WHERE CAST(Fecha_ingreso AS DATE) = ?;
        `; // Reemplaza 'Citas' con el nombre real de tu tabla
        const citas = await db.query(query, [formattedDate]);
        res.json(citas);
    } catch (error) {
        console.error('Error al obtener las citas del día:', error);
        res.status(500).json({ error: 'Error al obtener citas del día.' });
    }
};*/

const ObtenerCantCitasHoy = async(req, res)=>{
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query( `
            SELECT COUNT(*) AS cantidad 
            FROM Citas 
            WHERE CAST(Fecha_ingreso AS DATE) = CAST(GETDATE() AS DATE)
        `);
        res.json({ cantidad: result[0].cantidad });
    } catch (error) {
        console.error("Error al obtener las citas del dia:", error);
        res.status(500).json({ error: 'Error al contar citas del día.' });
    }
}



module.exports = {
    buscarAutoPorPlaca,
    obtenerEstados,
    crearCita,
    obtenerCitas,
    obtenerClientesYplaca,
    obtenerCitasPorMecanico,
    actualizarCita,
    eliminarCita,
    actualizarEstadoCita,
    actualizarFechaCita,
    obtenerCitasporEmpleado,
    obtenerCitasPorFecha,
    obtenerEstadosCitas,
   // ObtenerCitasHoy,
    ObtenerCantCitasHoy
    
};
