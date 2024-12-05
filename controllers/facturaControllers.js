const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

// Función para obtener el cliente asociado a la cita
const obtenerClientePorCita = async (Id_cita) => {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
        .input('Id_cita', sql.Int, Id_cita)
        .query(`
            SELECT 
                PCL.P_nombre AS NombreCliente,
                PCL.P_apellido AS ApellidoCliente,
                CL.Identidad AS IdentidadCliente
            FROM Citas C
            INNER JOIN Clientes CL ON C.Id_cliente = CL.Id_cliente
            INNER JOIN Personas PCL ON CL.Identidad = PCL.Identidad
            WHERE C.Id_cita = @Id_cita
        `);
    return result.recordset[0];
};

// Función para obtener el empleado asociado a la cita
const obtenerEmpleadoPorCita = async (Id_cita) => {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
        .input('Id_cita', sql.Int, Id_cita)
        .query(`
            SELECT 
                PE.P_nombre AS NombreEmpleado,
                PE.P_apellido AS ApellidoEmpleado,
                E.Identidad AS IdentidadEmpleado
            FROM Citas C
            INNER JOIN Empleados E ON C.Id_empleados = E.Id_empleados
            INNER JOIN Personas PE ON E.Identidad = PE.Identidad
            WHERE C.Id_cita = @Id_cita
        `);
    return result.recordset[0];
};

// Función para obtener los repuestos asociados a la cita
const obtenerRepuestosPorCita = async (Id_cita) => {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
        .input('Id_cita', sql.Int, Id_cita)
        .query(`
            SELECT 
                R.Nombre AS NombreRepuesto,
                RU.Cantidad_usada AS Cantidad,
                R.Precio AS PrecioUnidad,
                (RU.Cantidad_usada * R.Precio) AS TotalRepuesto
            FROM Repuesto_Utilizado RU
            INNER JOIN Inventarios I ON RU.Id_inventario = I.Id_inventario
            INNER JOIN Repuestos R ON I.Id_repuesto = R.Id_repuesto
            WHERE RU.Id_cita = @Id_cita
        `);
    return result.recordset;
};

// Función para obtener los servicios asociados a la cita
const obtenerServiciosPorCita = async (Id_cita) => {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
        .input('Id_cita', sql.Int, Id_cita)
        .query(`
            SELECT 
                S.Nombre AS NombreServicio,
                S.Precio AS PrecioServicio
            FROM Citas_Servicios CS
            INNER JOIN Servicios S ON CS.Id_servicio = S.Id_servicio
            WHERE CS.Id_cita = @Id_cita
        `);
    return result.recordset;
};

const guardarFactura = async (Id_cita, Subtotal, impuesto, total) => {
    const pool = await sql.connect(dbConfig);

    await pool.request()
        .input('Id_cita', sql.Int, Id_cita)
        .input('Subtotal', sql.Decimal(10, 2), Subtotal)
        .input('Impuesto', sql.Decimal(10, 2), impuesto)
        .input('Total', sql.Decimal(10, 2), total)
        .query(`
            INSERT INTO Factura (Id_cita, Subtotal, Impuesto, Total)
            VALUES (@Id_cita, @Subtotal, @Impuesto, @Total)
        `);
};

// Función para calcular los datos de la factura
const calcularFactura = async (Id_cita) => {
    const pool = await sql.connect(dbConfig);

    const facturaResult = await pool.request()
        .input('Id_cita', sql.Int, Id_cita)
        .query(`
            WITH TotalRepuestos AS (
                SELECT 
                    SUM(RU.Cantidad_usada * R.Precio) AS TotalRepuestos
                FROM 
                    Citas C
                LEFT JOIN 
                    Repuesto_Utilizado RU ON C.Id_cita = RU.Id_cita
                LEFT JOIN 
                    Inventarios I ON RU.Id_inventario = I.Id_inventario
                LEFT JOIN 
                    Repuestos R ON I.Id_repuesto = R.Id_repuesto
                WHERE 
                    C.Id_cita = @Id_cita
                GROUP BY 
                    C.Id_cita
            ),
            TotalServicios AS (
                SELECT 
                    SUM(S.Precio) AS TotalServicios
                FROM 
                    Citas C
                LEFT JOIN 
                    Citas_Servicios CS ON C.Id_cita = CS.Id_cita
                LEFT JOIN 
                    Servicios S ON CS.Id_servicio = S.Id_servicio
                WHERE 
                    C.Id_cita = @Id_cita
                GROUP BY 
                    C.Id_cita
            )
            SELECT 
                COALESCE(R.TotalRepuestos, 0) AS TotalRepuestos,
                COALESCE(S.TotalServicios, 0) AS TotalServicios,
                COALESCE(R.TotalRepuestos, 0) + COALESCE(S.TotalServicios, 0) AS Subtotal
            FROM 
                TotalRepuestos R
            FULL OUTER JOIN 
                TotalServicios S ON 1 = 1;
        `);

    const { TotalRepuestos, TotalServicios, Subtotal } = facturaResult.recordset[0];
    const impuesto = (Subtotal * 0.15).toFixed(2); // Formatear a 2 decimales
    const total = (Subtotal + parseFloat(impuesto)).toFixed(2); // Formatear a 2 decimales

    return { Subtotal, impuesto, total };
};

// Controlador para generar y guardar la factura
const generarFactura = async (req, res) => {
    const { Id_cita } = req.params;

    try {
        const pool = await sql.connect(dbConfig);

        // Verificar si ya existe una factura para la cita
        const facturaExistenteResult = await pool.request()
            .input('Id_cita', sql.Int, Id_cita)
            .query('SELECT COUNT(*) AS FacturaCount FROM Factura WHERE Id_cita = @Id_cita');
        
        if (facturaExistenteResult.recordset[0].FacturaCount > 0) {
            return res.status(400).json({ message: 'Ya se ha generado una factura para esta cita.' });
        }

        // Verificar el estado de la cita
        const estadoResult = await pool.request()
            .input('Id_cita', sql.Int, Id_cita)
            .query(`
                SELECT EC.Nombre AS Estado
                FROM Citas C
                JOIN Estados_Citas EC ON C.Id_estado = EC.Id_estado
                WHERE C.Id_cita = @Id_cita
            `);

        const estado = estadoResult.recordset[0]?.Estado;

        if (!estado) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        if (estado !== 'Finalizada') {
            return res.status(400).json({ message: 'La cita debe estar en estado Finalizado para generar la factura' });
        }

        // Obtener la información del cliente, empleado, repuestos y servicios
        const cliente = await obtenerClientePorCita(Id_cita);
        const empleado = await obtenerEmpleadoPorCita(Id_cita);
        const repuestos = await obtenerRepuestosPorCita(Id_cita);
        const servicios = await obtenerServiciosPorCita(Id_cita);

        // Calcular los datos de la factura
        const { Subtotal, impuesto, total } = await calcularFactura(Id_cita);

        // Obtener la fecha actual
        const fechaLocal = new Date();
        const fecha = new Date(fechaLocal.getTime() - fechaLocal.getTimezoneOffset()*60000);

        // Guardar la factura en la base de datos
        await guardarFactura(Id_cita, Subtotal, impuesto, total, fecha);

        // Responder con los datos de la factura
        return res.json({
            message: 'Factura generada y guardada con éxito',
            datosFactura: {
                Id_cita,
                Subtotal,
                Impuesto: impuesto,
                Total: total,
                Fecha: fecha.toISOString(),
                cliente,
                empleado,
                repuestos,
                servicios,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al generar la factura', error });
    }
};


const obtenerFacturasSiEsMecanico = async (req, res) => {
    const { Id_empleado } = req.params; // Recibimos el ID del empleado como parámetro

    try {
        const pool = await sql.connect(dbConfig);

        // Verificar si el empleado tiene el rol "Mecánico"
        const rolResult = await pool.request()
    .input('Id_empleado', sql.Int, Id_empleado)
    .query(`
        SELECT U.Rol AS RolEmpleado
        FROM Empleados E
        INNER JOIN Usuarios U ON E.Id_usuario = U.Id_usuario
        WHERE E.Id_empleados = @Id_empleado
    `);

const rolEmpleado = rolResult.recordset[0];

if (!rolEmpleado) {
    return res.status(404).json({ 
        message: 'Empleado no encontrado' 
    });
}

if (rolEmpleado.RolEmpleado !== 'Mecanico') {
    return res.status(403).json({ 
        message: 'El empleado no tiene el rol de Mecánico', 
    });
}

        // Obtener las facturas asociadas al mecánico
        const facturasResult = await pool.request()
            .input('Id_empleado', sql.Int, Id_empleado)
            .query(`
                SELECT 
                    F.Id_cita,
                    F.Subtotal,
                    F.Impuesto,
                    F.Total,
                    F.Fecha
                FROM Factura F
                INNER JOIN Citas C ON F.Id_cita = C.Id_cita
                WHERE C.Id_empleados = @Id_empleado
            `);

        const facturas = facturasResult.recordset;

        if (facturas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron facturas para este mecánico' });
        }

        // Preparar los datos detallados para cada factura
        const datosFacturas = await Promise.all(
            facturas.map(async (factura) => {
                const cliente = await obtenerClientePorCita(factura.Id_cita);
                const empleado = await obtenerEmpleadoPorCita(factura.Id_cita);
                const repuestos = await obtenerRepuestosPorCita(factura.Id_cita);
                const servicios = await obtenerServiciosPorCita(factura.Id_cita);

                return {
                    Id_cita: factura.Id_cita,
                    Subtotal: factura.Subtotal,
                    Impuesto: factura.Impuesto,
                    Total: factura.Total,
                    Fecha: factura.Fecha.toISOString(),
                    cliente,
                    empleado,
                    repuestos,
                    servicios,
                };
            })
        );

        // Responder con las facturas detalladas
        return res.json({
            message: 'Facturas obtenidas con éxito',
            datosFacturas,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las facturas', error });
    }
};

const obtenerFacturasSiEsAdministrador = async (req, res) => {
    const { Id_empleado } = req.params; // Recibimos el ID del empleado como parámetro

    try {
        const pool = await sql.connect(dbConfig);

        // Verificar si el empleado tiene el rol "Administrador"
        const rolResult = await pool.request()
            .input('Id_empleado', sql.Int, Id_empleado)
            .query(`
                SELECT U.Rol AS RolEmpleado
                FROM Empleados E
                INNER JOIN Usuarios U ON E.Id_usuario = U.Id_usuario
                WHERE E.Id_empleados = @Id_empleado
            `);

        // Depurar el resultado
        

        const rolEmpleado = rolResult.recordset[0];

        if (!rolEmpleado) {
            return res.status(404).json({ 
                message: 'Empleado no encontrado' 
            });
        }

        if (rolEmpleado.RolEmpleado !== 'Administrador') {
            return res.status(403).json({ 
                message: 'El empleado no tiene el rol de Administrador', 
            });
        }

        // Obtener todas las facturas de la tabla Factura
        const facturasResult = await pool.request().query(`
            SELECT 
                F.Id_cita,
                F.Subtotal,
                F.Impuesto,
                F.Total,
                F.Fecha
            FROM Factura F
        `);

        const facturas = facturasResult.recordset;

        if (facturas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron facturas' });
        }

        // Preparar los datos detallados para cada factura
        const datosFacturas = await Promise.all(
            facturas.map(async (factura) => {
                const cliente = await obtenerClientePorCita(factura.Id_cita);
                const empleado = await obtenerEmpleadoPorCita(factura.Id_cita);
                const repuestos = await obtenerRepuestosPorCita(factura.Id_cita);
                const servicios = await obtenerServiciosPorCita(factura.Id_cita);

                return {
                    Id_cita: factura.Id_cita,
                    Subtotal: factura.Subtotal,
                    Impuesto: factura.Impuesto,
                    Total: factura.Total,
                    Fecha: factura.Fecha.toISOString(),
                    cliente,
                    empleado,
                    repuestos,
                    servicios,
                };
            })
        );

        // Responder con las facturas detalladas
        return res.json({
            message: 'Facturas obtenidas con éxito',
            datosFacturas,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las facturas', error });
    }
};

//Eliminacion de factura 
const eliminarFactura = async (req, res) => {
    const { Id_cita } = req.params;

    try {
        const pool = await sql.connect(dbConfig);

        // Eliminar el cliente de la tabla Clientes usando Identidad
        await pool.request()
            .input('Id_cita', sql.NVarChar, Id_cita)
            .query('DELETE FROM Factura WHERE Id_cita = @Id_cita');

        // No es necesario eliminar de la tabla Personas ya que existe un trigger que se encargará de eso

        res.status(200).send('Factura eliminada correctamente');
    } catch (error) {
        console.error('Error al eliminar factura:', error);
        res.status(500).send('Error al eliminar la factura');
    }
};

module.exports = { generarFactura , obtenerFacturasSiEsMecanico, obtenerFacturasSiEsAdministrador, eliminarFactura };