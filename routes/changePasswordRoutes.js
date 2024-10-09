const express = require('express');
const router = express.Router();
const changePasswordController = require('../controllers/changePasswordController');

// Ruta para cambio de contraseña por el administrador
router.post('/admin', changePasswordController.adminChangePassword);

// Ruta para cambio de contraseña por el mecánico
router.post('/mecanico', changePasswordController.mecanicoChangePassword);

module.exports = router;