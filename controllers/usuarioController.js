const sql = require('mssql');
const bcrypt = require('bcrypt'); // Asegúrate de instalar bcrypt
const dbConfig = require('../config/dbConfig'); // Importar tu configuración de DB




const agregarUsuarioCompleto = async (req, res) => {
    const {
        Identidad, P_nombre, S_nombre, P_apellido, S_apellido,
        Direccion, Telefono, Fecha_nac, Correo, Genero,
        Nombre, Email, Contraseña, Rol, Ocupacion, Salario, Fecha_contratacion, Id_departamento
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
            .input('Id_departamento', sql.Int, parseInt(Id_departamento, 10)) // Asegúrate de que sea un int
            .input('P_nombre', sql.NVarChar, P_nombre)
            .input('S_nombre', sql.NVarChar, S_nombre || '') // Proporcionar un valor por defecto
            .input('P_apellido', sql.NVarChar, P_apellido)
            .input('S_apellido', sql.NVarChar, S_apellido || '') // Proporcionar un valor por defecto
            .input('Direccion', sql.NVarChar, Direccion)
            .input('Telefono', sql.NVarChar, Telefono || '') // Proporcionar un valor por defecto
            .input('Fecha_nac', sql.Date, Fecha_nac)
            .input('correo', sql.NVarChar, Email) // Asegúrate de que no sea nulo si tienes un valor
            .input('Genero', sql.NVarChar, Genero)
            .query('INSERT INTO Personas (Identidad, Id_departamento, P_nombre, S_nombre, P_apellido, S_apellido, Direccion, Telefono, Fecha_nac, correo, Genero) VALUES (@Identidad, @Id_departamento, @P_nombre, @S_nombre, @P_apellido, @S_apellido, @Direccion, @Telefono, @Fecha_nac, @correo, @Genero)');

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

//buscar empleados 
const buscarUsuario = async (req, res) => {
    const { identidad } = req.params;

    const pool = await sql.connect(dbConfig);

    try {
        const result = await pool.request()
            .input('Identidad', sql.NVarChar, identidad)
            .query(`
                SELECT u.Nombre,
                u.Email, u.Contraseña, u.Rol, p.Identidad,p.Id_departamento,p.P_nombre,p.S_nombre,p.P_apellido,
                p.S_apellido,p.Direccion,p.Telefono,p.Fecha_nac,p.Genero, e.Ocupacion,e.Salario,e.Fecha_contratacion
                FROM Empleados e JOIN Personas p ON e.Identidad = p.Identidad 
                JOIN Usuarios u ON p.correo = u.Email
                WHERE e.Identidad = @Identidad;
            `);

        if (result.recordset.length === 0) {
            return res.status(404).send({ error: 'Usuario no encontrado.' });
        }

        res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error('Error al buscar usuario:', error);
        res.status(500).send({ error: error.message });
    } finally {
        pool.close();
    }
};

//actualizar empleados 

const actualizarUsuario = async (req, res) => {
    const { identidad } = req.params;
    const {
        Nombre,Email, Contraseña, Rol,
        P_nombre, S_nombre, P_apellido, S_apellido, Direccion, Telefono, Fecha_nac, Genero,
        Ocupacion, Salario, Fecha_contratacion,Id_departamento
    } = req.body;

    const pool = await sql.connect(dbConfig);

    try {
        // Hashear la nueva contraseña si se proporciona
        let hashedPassword = Contraseña ? await bcrypt.hash(Contraseña, 10) : null;

        // Actualizar en la tabla Usuarios
        await pool.request()
    .input('Email', sql.NVarChar, Email) // Cambia Identidad por Email
    .input('Nombre', sql.NVarChar, Nombre)
    .input('Contraseña', sql.NVarChar, hashedPassword)
    .input('Rol', sql.NVarChar, Rol)
    .query(`
        UPDATE Usuarios
        SET Nombre = @Nombre,
            Contraseña = COALESCE(@Contraseña, Contraseña),
            Rol = @Rol
        WHERE Email = @Email -- Aquí deberías usar el email
    `);

        // Actualizar en la tabla Personas
        await pool.request()
            .input('Identidad', sql.NVarChar, identidad)
            .input('Id_departamento', sql.Int, parseInt(Id_departamento, 10))
            .input('P_nombre', sql.NVarChar, P_nombre)
            .input('S_nombre', sql.NVarChar, S_nombre || '')
            .input('P_apellido', sql.NVarChar, P_apellido)
            .input('S_apellido', sql.NVarChar, S_apellido || '')
            .input('Direccion', sql.NVarChar, Direccion)
            .input('Telefono', sql.NVarChar, Telefono || '')
            .input('Fecha_nac', sql.Date, Fecha_nac)
            .input('Genero', sql.NVarChar, Genero)
            .query(`
                UPDATE Personas
                SET P_nombre = @P_nombre,
                    S_nombre = @S_nombre,
                    P_apellido = @P_apellido,
                    S_apellido = @S_apellido,
                    Direccion = @Direccion,
                    Telefono = @Telefono,
                    Fecha_nac = @Fecha_nac,
                    Genero = @Genero,
                    Id_departamento = @Id_departamento
                WHERE Identidad = @Identidad
            `);

        // Actualizar en la tabla Empleados
        await pool.request()
            .input('Identidad', sql.NVarChar, identidad)
            .input('Ocupacion', sql.NVarChar, Ocupacion)
            .input('Salario', sql.Decimal(10, 2), Salario)
            .input('Fecha_contratacion', sql.Date, Fecha_contratacion)
            .query(`
                UPDATE Empleados
                SET Ocupacion = @Ocupacion,
                    Salario = @Salario,
                    Fecha_contratacion = @Fecha_contratacion
                WHERE Identidad = @Identidad
            `);

        res.status(200).send('Usuario actualizado correctamente');
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).send({ error: error.message });
    } finally {
        pool.close();
    }
};

// eliminar usuario

const eliminarUsuario = async (req, res) => {
    const { identidad, Email } = req.params;

    const pool = await sql.connect(dbConfig);

    try {
        // Eliminar de la tabla Empleados
        const resultEmpleados = await pool.request()
            .input('Identidad', sql.NVarChar, identidad)
            .query('DELETE FROM Empleados WHERE Identidad = @Identidad');

        // Eliminar de la tabla Personas
        const resultPersonas = await pool.request()
            .input('Identidad', sql.NVarChar, identidad)
            .query('DELETE FROM Personas WHERE Identidad = @Identidad');

        // Eliminar de la tabla Usuarios
        const resultUsuarios = await pool.request()
            .input('Email', sql.NVarChar, Email)
            .query('DELETE FROM Usuarios WHERE Email = @Email');

        // Verificar si se eliminaron registros
        if (resultEmpleados.rowsAffected[0] === 0 && resultPersonas.rowsAffected[0] === 0 && resultUsuarios.rowsAffected[0] === 0) {
            return res.status(404).send({ error: 'Usuario no encontrado.' });
        }

        res.status(200).send('Usuario eliminado correctamente');
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).send({ error: error.message });
    } finally {
        pool.close();
    }
};

// Exportar la función
module.exports = {
    agregarUsuarioCompleto,
    buscarUsuario,
    actualizarUsuario,
    eliminarUsuario
};
