const express = require('express');
const router = express.Router();
const {
    agregarRepuestoUtilizado,
    eliminarRepuestoUtilizado,
    getRepuestosDisponibles
} = require('../controllers/agregarRepuestoCitasControllers');

// Rutas
router.post('/utilizados', agregarRepuestoUtilizado);
router.delete('/eliminados/:id', eliminarRepuestoUtilizado);
router.get('/', getRepuestosDisponibles);

module.exports = router;