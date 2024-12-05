const sql = require("mssql");
const dbConfig = require("../config/dbConfig");

const getMarcasYProveedores = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const marcasResult = await pool.request()
            .query("SELECT Id_marca_repuesto, Nombre FROM [dbo].[Marca_repuestos]");
        const proveedoresResult = await pool.request()
            .query("SELECT Id_proveedor, Nombre FROM [dbo].[Proveedores]");

        res.json({
            marcas: marcasResult.recordset,
            proveedores: proveedoresResult.recordset
        });
    } catch (error) {
        console.error("Error al obtener marcas y proveedores:", error);
        res.status(500).json({ message: "Error al obtener marcas y proveedores" });
    }
};

const obtenerRepuestos = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT Id_repuesto, Nombre FROM Repuestos");
        res.json(result.recordset);
    } catch (error) {
        console.error("Error al obtener repuestos:", error);
        res.status(500).json({ message: "Error al obtener repuestos" });
    }
};

const obtenerInventario = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query(`SELECT i.Id_inventario, r.Nombre AS nombre, r.Descripcion AS descripcion, 
                    m.Nombre AS marca, p.Nombre AS proveedor, r.Precio AS precio, 
                    i.Cantidad_disponible, 
                    CONVERT(varchar, i.Fecha_ingreso, 23) AS Fecha_ingreso
                    FROM Inventarios i
                    JOIN Repuestos r ON i.Id_repuesto = r.Id_repuesto
                    JOIN Marca_repuestos m ON r.Id_marca_repuesto = m.Id_marca_repuesto
                    JOIN Proveedores p ON r.Id_proveedor = p.Id_proveedor`);
        res.json(result.recordset);
    } catch (error) {
        console.error("Error al obtener el inventario:", error);
        res.status(500).json({ message: "Error al obtener el inventario" });
    }
};

const agregarInventario = async (req, res) => {
    const { Id_repuesto, Fecha_ingreso, Cantidad_disponible} = req.body;

    // if (Fecha_inicio < Fecha_ingreso || Fecha_fin < Fecha_inicio) {
    //     return res.status(400).json({ message: "Fechas inválidas" });
    // }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input("Id_repuesto", sql.Int, Id_repuesto)
            .input("Fecha_ingreso", sql.Date, Fecha_ingreso)
            .input("Cantidad_disponible", sql.Int, Cantidad_disponible)
            .query("INSERT INTO Inventarios (Id_repuesto, Fecha_ingreso, Cantidad_disponible) OUTPUT inserted.Id_inventario AS id VALUES (@Id_repuesto, @Fecha_ingreso, @Cantidad_disponible)");
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error("Error al agregar al inventario:", error);
        res.status(500).json({ message: "Error al agregar al inventario" });
    }
};

// Función para actualizar un registro en el inventario
const actualizarInventario = async (req, res) => {
    const { id } = req.params; 
    const { Id_repuesto, Fecha_ingreso, Cantidad_disponible } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input("Id_inventario", sql.Int, id)
            .input("Id_repuesto", sql.Int, Id_repuesto)
            .input("Fecha_ingreso", sql.Date, Fecha_ingreso)
            .input("Cantidad_disponible", sql.Int, Cantidad_disponible)
            .query(`UPDATE Inventarios 
                    SET Id_repuesto = @Id_repuesto, 
                        Fecha_ingreso = @Fecha_ingreso, 
                        Cantidad_disponible = @Cantidad_disponible
                    WHERE Id_inventario = @Id_inventario`);
                    
        res.status(200).json({ message: "Inventario actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar el inventario:", error);
        res.status(500).json({ message: "Error al actualizar el inventario" });
    }
};

// Función para eliminar un registro en el inventario
const eliminarInventario = async (req, res) => {
    const { id } = req.params; // ID del inventario a eliminar

    try {
        const pool = await sql.connect(dbConfig);

        // Verificar si el inventario está en uso y obtener las placas de los autos involucrados
        const result = await pool.request()
            .input("Id_inventario", sql.Int, id)
            .query(`
                SELECT a.Placa
                FROM Repuesto_Utilizado ru
                JOIN Citas c ON ru.Id_cita = c.Id_cita
                JOIN Autos a ON c.Id_auto = a.Id_auto
                WHERE ru.Id_inventario = @Id_inventario
            `);

        // Si el inventario está en uso, devolver las placas de los autos
        if (result.recordset.length > 0) {
            const placas = result.recordset.map(row => row.Placa).join(", ");
            return res.status(400).json({
                message: `No se puede eliminar el inventario porque se está utilizando en la(s) cita(s) del(los) carro(s) con placa(s): ${placas}`
            });
        }

        // Eliminar inventario si no está en uso
        await pool.request()
            .input("Id_inventario", sql.Int, id)
            .query("DELETE FROM Inventarios WHERE Id_inventario = @Id_inventario");

        res.status(200).json({ message: "Inventario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el inventario" });
    }
};




module.exports = {
    getMarcasYProveedores,
    obtenerRepuestos,
    agregarInventario,
    obtenerInventario,
    eliminarInventario,
    actualizarInventario
};
