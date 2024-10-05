const express = require('express');
const { agregarUsuario } = require('../controllers/agregarUsuarioController');

const router = express.Router();

// Ruta para agregar un usuario
router.post('/agregar', agregarUsuario);

module.exports = router;