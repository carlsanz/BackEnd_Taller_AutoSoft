const sql = require('mssql');
const dbConfig = require('../config/dbConfig'); // Importar tu configuración de DB

const agregarUsuarioCompleto = async (req, res) => {
    const {
        Identidad, P_nombre, S_nombre, P_apellido, S_apellido,
        Direccion, Telefono, Fecha_nac, correo, Genero,
        Nombre, Email, Contraseña, Rol, Ocupacion, Salario, Fecha_contratacion, Id_colonia
    } = req.body;

    console.log(req.body); // Para depuración

    const pool = await sql.connect(dbConfig);

    // Validar campos obligatorios
    if (!Identidad || !P_nombre || !P_apellido || !Email || !Contraseña || !Rol || !Ocupacion || !Salario || !Fecha_contratacion) {
        return res.status(400).send({ error: 'Todos los campos son requeridos.' });
    }

    try {
        // Validar existencia de email
        const existingUser = await pool.request()
            .input('Email', sql.NVarChar, Email)
            .query('SELECT COUNT(*) as count FROM Usuarios WHERE Email = @Email');
        
        if (existingUser.recordset[0].count > 0) {
            return res.status(400).send({ error: 'El email ya está registrado.' });
        }

        // Inserción en la tabla Usuarios
        const resultUsuario = await pool.request()
            .input('Nombre', sql.NVarChar, Nombre)
            .input('Email', sql.NVarChar, Email)
            .input('Contraseña', sql.NVarChar, Contraseña)
            .input('Rol', sql.NVarChar, Rol)
            .query('INSERT INTO Usuarios (Nombre, Email, Contraseña, Rol) OUTPUT INSERTED.Id_usuario VALUES (@Nombre, @Email, @Contraseña, @Rol)');
        
        const idUsuario = resultUsuario.recordset[0].Id_usuario;

        // Inserción en la tabla Personas
        await pool.request()
            .input('Identidad', sql.NVarChar, Identidad)
            .input('Id_colonia', sql.Int, parseInt(Id_colonia, 10)) // Asegúrate de que sea un int
            .input('P_nombre', sql.NVarChar, P_nombre)
            .input('S_nombre', sql.NVarChar, S_nombre)
            .input('P_apellido', sql.NVarChar, P_apellido)
            .input('S_apellido', sql.NVarChar, S_apellido)
            .input('Direccion', sql.NVarChar, Direccion)
            .input('Telefono', sql.NVarChar, Telefono)
            .input('Fecha_nac', sql.Date, Fecha_nac)
            .input('correo', sql.NVarChar, correo)
            .input('Genero', sql.NVarChar, Genero)
            .query('INSERT INTO Personas (Identidad, Id_colonia, P_nombre, S_nombre, P_apellido, S_apellido, Direccion, Telefono, Fecha_nac, correo, Genero) VALUES (@Identidad, @Id_colonia, @P_nombre, @S_nombre, @P_apellido, @S_apellido, @Direccion, @Telefono, @Fecha_nac, @correo, @Genero)');

        // Inserción en la tabla Empleados
        await pool.request()
            .input('Identidad', sql.NVarChar, Identidad)
            .input('Ocupacion', sql.NVarChar, Ocupacion)
            .input('Salario', sql.Decimal(10, 2), Salario)
            .input('Fecha_contratacion', sql.Date, Fecha_contratacion)
            .input('Id_usuario', sql.Int, idUsuario)
            .query('INSERT INTO Empleados (Identidad, Ocupacion, Salario, Fecha_contratacion, Id_usuario) VALUES (@Identidad, @Ocupacion, @Salario, @Fecha_contratacion, @Id_usuario)');

        res.status(200).send('Usuario agregado correctamente');
    } catch (error) {
        console.error('Error al agregar usuario:', error);
        res.status(400).send({ error: error.message });
    } finally {
        pool.close();
    }
};


// Exportar la función
module.exports = {
    agregarUsuarioCompleto,
};
