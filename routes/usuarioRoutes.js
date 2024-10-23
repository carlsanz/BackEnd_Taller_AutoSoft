const express = require('express');
const router = express.Router();

const { agregarUsuarioCompleto,
    buscarUsuario,
    actualizarUsuario,
    eliminarUsuario
 } = require('../controllers/usuarioController');

//para agregar a los usuarios 
router.post('/', agregarUsuarioCompleto); 

//buscar usuario
router.get('/:identidad', buscarUsuario);

//actualizar usuario
router.put('/:identidad', actualizarUsuario);

//eliminar usuario
router.delete('/:identidad/:Email', eliminarUsuario);




module.exports = router;