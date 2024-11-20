const express = require('express');
const router = express.Router();
const {
    agregarRepuestoUtilizado,
    // eliminarRepuestoUtilizado,
    getRepuestosDisponibles,
    obtenerRepuestosPorCita,
    eliminarRepuestoPorInventario
} = require('../controllers/agregarRepuestoCitasControllers');

// Rutas
router.post('/utilizados', agregarRepuestoUtilizado);
//router.delete('/eliminados/:id', eliminarRepuestoUtilizado);
router.get('/', getRepuestosDisponibles);
router.get('/:id_cita', obtenerRepuestosPorCita);
router.delete('/:id_cita/:id_inventario' , eliminarRepuestoPorInventario )


module.exports = router;