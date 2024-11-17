const express = require('express');
const router = express.Router();
const {
    agregarRepuestoUtilizado,
    eliminarRepuestoUtilizado,
} = require('../controllers/agregarRepuestoCitasControllers');

// Rutas
router.post('/utilizados', agregarRepuestoUtilizado);
router.delete('/eliminados/:id', eliminarRepuestoUtilizado);

module.exports = router;