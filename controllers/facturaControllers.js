const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

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
    const impuesto = Subtotal * 0.15; // 15% de impuesto
    const total = Subtotal + impuesto;

    return { Subtotal, impuesto, total };
};

// Función para guardar la factura en la base de datos
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

const obtenerFacturaPorId = async (Id_factura) => {
    const pool = await sql.connect(dbConfig);

    // Obtener los datos completos de la factura
    const result = await pool.request()
        .input('Id_factura', sql.Int, Id_factura)
        .query(`
            SELECT 
                F.Id_factura,
                F.Id_cita,
                F.Fecha,
                F.Subtotal,
                F.Impuesto,
                F.Total,
                C.Fecha AS Fecha_Cita,
                C.Descripcion,
                EC.Nombre AS Estado_Cita
            FROM Factura F
            INNER JOIN Citas C ON F.Id_cita = C.Id_cita
            INNER JOIN Estados_Citas EC ON C.Id_estado = EC.Id_estado
            WHERE F.Id_factura = @Id_factura
        `);

    return result.recordset[0];
};

// Controlador para generar y guardar la factura
const generarFactura = async (req, res) => {
    const { Id_cita } = req.params;

    try {
        const pool = await sql.connect(dbConfig);

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

        // Calcular los datos de la factura
        const { Subtotal, impuesto, total } = await calcularFactura(Id_cita);
        const{Id_factura}=await obtenerFacturaPorId(Id_cita)

        // Guardar la factura en la base de datos
        await guardarFactura(Id_cita, Subtotal, impuesto, total);

        // Responder con los datos de la factura
        return res.json({
            message: 'Factura generada y guardada con éxito',
            datosFactura: {
                Id_factura,
                Id_cita,
                Subtotal,
                Impuesto: impuesto,
                Total: total,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al generar la factura', error });
    }
};

module.exports = { generarFactura };
