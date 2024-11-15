const sql = require('mssql');
const dbConfig = require('../config/dbConfig');

// Obtener auto por placa
const getAutoByPlate = async (req, res) => {
    const { placa } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('placa', sql.VarChar, placa)
            .query('SELECT * FROM Autos WHERE Placa = @placa');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Auto no encontrado' });
        }
        
        return res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al obtener el auto' });
    }
};

// Verificar cliente por identidad
const verifyClient = async (req, res) => {
    const { identidad } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('identidad', sql.VarChar, identidad)
            .query("SELECT CONCAT(Personas.P_nombre, ' ', Personas.P_apellido) AS Nombre, Clientes.Identidad FROM Clientes INNER JOIN Personas ON Clientes.Identidad = Personas.Identidad WHERE Clientes.Identidad = @identidad");


        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        return res.json(result.recordset[0]); // Devuelve el cliente encontrado
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Cliente no encontrado' });
    }
};

// Agregar un nuevo auto

const addAuto = async (req, res) => {
    console.log(req.body);
    const { Placa, Id_modelo, Id_tipo, Id_color, Numero_vin, Identidad } = req.body;

    try {
        const pool = await sql.connect(dbConfig);

        // Verificar si el cliente existe
        const clientQuery = await pool.request()
            .input('identidad', sql.VarChar, Identidad)
            .query('SELECT * FROM Clientes WHERE Identidad = @identidad');

        if (clientQuery.recordset.length === 0) {
            return res.status(404).json({ message: 'El cliente con esta identidad no existe.' });
        }

        // Si el cliente existe, insertar el auto
        await pool.request()
            .input('placa', sql.VarChar, Placa)
            .input('id_modelo', sql.Int, Id_modelo)
            .input('id_tipo', sql.Int, Id_tipo)
            .input('id_color', sql.Int, Id_color)
            .input('numero_vin', sql.VarChar, Numero_vin)
            .input('identidad', sql.VarChar, Identidad) // Agrega esta línea para pasar la identidad
            .query('INSERT INTO Autos (Placa, Id_modelo, Id_tipo, Id_color, Numero_vin, Identidad) VALUES (@placa, @id_modelo, @id_tipo, @id_color, @numero_vin, @identidad)');

        return res.status(201).json({ message: 'Auto agregado con éxito' });
    } catch (err) {
        console.error('Error al agregar el auto:', err);
        return res.status(500).json({ message: 'Error al agregar el auto' });
    }
};


// Actualizar auto por placa
const updateAutoByPlate = async (req, res) => {
    const { Id_modelo, Id_tipo, Id_color, Numero_vin, Identidad } = req.body;
    const placa = req.params.placa; 

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('placa', sql.VarChar, placa) 
            .input('id_modelo', sql.Int, Id_modelo)
            .input('id_tipo', sql.Int, Id_tipo)
            .input('id_color', sql.Int, Id_color)
            .input('numero_vin', sql.VarChar, Numero_vin)
            .input('identidad', sql.VarChar, Identidad)
            .query('UPDATE Autos SET Id_modelo = @id_modelo, Id_tipo = @id_tipo, Id_color = @id_color, Numero_vin = @numero_vin, Identidad = @identidad WHERE Placa = @placa');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Auto no encontrado' });
        }

        return res.json({ message: 'Auto actualizado con éxito' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al actualizar el auto' });
    }
};



// Eliminar auto por placa
const deleteAutoByPlate = async (req, res) => {
    const { placa } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('placa', sql.VarChar, placa)
            .query('DELETE FROM Autos WHERE Placa = @placa');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Auto no encontrado' });
        }

        return res.json({ message: 'Auto eliminado con éxito' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al eliminar el auto' });
    }
};

//obtener modelos
const getModelos = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query('SELECT Id_modelo, Nombre FROM Modelos');
        
        return res.json(result.recordset); // Devolver todos los modelos
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al obtener modelos' });
    }
};


//obtener tipos
const getTipos = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query('SELECT Id_tipo, Nombre FROM Tipo_autos');
        
        return res.json(result.recordset); // Devolver todos los tipos
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al obtener tipos' });
    }
};

// Obtener Colores
const getColores = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query('SELECT Id_color, Nombre FROM Colores');
        
        return res.json(result.recordset); // Devolver todos los colores
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al obtener colores' });
    }
};



//Obtener Autos 
const obtenerAutos = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const resultado = await pool.request().query(`
            SELECT 
                a.Id_auto, 
                a.Placa, 
                m.Nombre AS Modelo, 
                t.Nombre AS Tipo, 
                c.Nombre AS Color,
                a.Numero_vin
            FROM Autos a
            INNER JOIN Modelos m ON a.Id_modelo = m.Id_modelo
            INNER JOIN Tipo_autos t ON a.Id_tipo = t.Id_tipo
            INNER JOIN Colores c ON a.Id_color = c.Id_color
        `);

        res.status(200).json(resultado.recordset); // Devolver los autos con detalles
    } catch (error) {
        console.error('Error al obtener los autos con detalles:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};



module.exports = {
    getAutoByPlate,
    verifyClient,
    addAuto,
    updateAutoByPlate,
    deleteAutoByPlate,
    getModelos,
    getTipos,
    getColores,
    obtenerAutos,
    
};
