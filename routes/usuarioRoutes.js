const express = require('express');
const router = express.Router();

const { agregarUsuarioCompleto,
    buscarUsuario,
    actualizarUsuario,
    eliminarUsuario,
    obtenerEmpleados
 } = require('../controllers/usuarioController');

//para agregar a los usuarios 
router.post('/', agregarUsuarioCompleto); 

//buscar usuario
router.get('/empleados/:identidad', buscarUsuario);

//actualizar usuario
router.put('/:identidad', actualizarUsuario);

//eliminar usuario
router.delete('/:identidad/:Email', eliminarUsuario);


router.get('/empleados', obtenerEmpleados);




module.exports = router;