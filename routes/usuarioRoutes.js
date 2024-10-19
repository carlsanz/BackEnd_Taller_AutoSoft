const express = require('express');
const router = express.Router();

const { agregarUsuarioCompleto } = require('../controllers/usuarioController');


router.post('/', agregarUsuarioCompleto); 


module.exports = router;