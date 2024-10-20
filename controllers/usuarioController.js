const sql = require('mssql');
const bcrypt = require('bcrypt'); // Asegúrate de instalar bcrypt
const dbConfig = require('../config/dbConfig'); // Importar tu configuración de DB

const agregarUsuarioCompleto = async (req, res) => {
    const {
        Identidad, P_nombre, S_nombre, P_apellido, S_apellido,
        Direccion, Telefono, Fecha_nac, Correo, Genero,
        Nombre, Email, Contraseña, Rol, Ocupacion, Salario, Fecha_contratacion, Id_colonia
    } = req.body;

    console.log(req.body); // Para depuración

    const pool = await sql.connect(dbConfig);

    // Validar campos obligatorios
    if (!Identidad || !P_nombre || !P_apellido || !Email || !Contraseña || !Rol || !Ocupacion || !Salario || !Fecha_contratacion) {
        return res.status(400).send({ error: 'Todos los campos son requeridos.' });
    }

    // Validar formato de Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
        return res.status(400).send({ error: 'El formato del email es inválido.' });
    }

    // Iniciar la transacción
    let transaction;
    try {
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Validar existencia de email en la tabla Usuarios
        const existingUserEmail = await pool.request()
            .input('Email', sql.NVarChar, Email)
            .query('SELECT COUNT(*) as count FROM Usuarios WHERE Email = @Email');

        if (existingUserEmail.recordset[0].count > 0) {
            await transaction.rollback();
            return res.status(400).send({ error: 'El email ya está registrado.' });
        }

        // Validar existencia de identidad en la tabla Personas
        const existingIdentity = await pool.request()
            .input('Identidad', sql.NVarChar, Identidad)
            .query('SELECT COUNT(*) as count FROM Personas WHERE Identidad = @Identidad');

        if (existingIdentity.recordset[0].count > 0) {
            await transaction.rollback();
            return res.status(400).send({ error: 'La identidad ya está registrada.' });
        }

        // Hashear la contraseña antes de la inserción
        const hashedPassword = await bcrypt.hash(Contraseña, 10);

        // Inserción en la tabla Usuarios
        const resultUsuario = await pool.request()
            .input('Nombre', sql.NVarChar, Nombre)
            .input('Email', sql.NVarChar, Email)
            .input('Contraseña', sql.NVarChar, hashedPassword) // Usar la contraseña hasheada
            .input('Rol', sql.NVarChar, Rol)
            .query('INSERT INTO Usuarios (Nombre, Email, Contraseña, Rol) OUTPUT INSERTED.Id_usuario VALUES (@Nombre, @Email, @Contraseña, @Rol)');

        const idUsuario = resultUsuario.recordset[0].Id_usuario;

        // Inserción en la tabla Personas
        await pool.request()
            .input('Identidad', sql.NVarChar, Identidad)
            .input('Id_colonia', sql.Int, parseInt(Id_colonia, 10)) // Asegúrate de que sea un int
            .input('P_nombre', sql.NVarChar, P_nombre)
            .input('S_nombre', sql.NVarChar, S_nombre || '') // Proporcionar un valor por defecto
            .input('P_apellido', sql.NVarChar, P_apellido)
            .input('S_apellido', sql.NVarChar, S_apellido || '') // Proporcionar un valor por defecto
            .input('Direccion', sql.NVarChar, Direccion)
            .input('Telefono', sql.NVarChar, Telefono || '') // Proporcionar un valor por defecto
            .input('Fecha_nac', sql.Date, Fecha_nac)
            .input('correo', sql.NVarChar, Email) // Asegúrate de que no sea nulo si tienes un valor
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

        // Confirmar transacción
        await transaction.commit();
        res.status(200).send('Usuario agregado correctamente');
    } catch (error) {
        console.error('Error al agregar usuario:', error);
        // Si hay algún error, hacer rollback de la transacción
        if (transaction) await transaction.rollback();
        res.status(400).send({ error: error.message });
    } finally {
        pool.close();
    }
};

// Exportar la función
module.exports = {
    agregarUsuarioCompleto,
};
