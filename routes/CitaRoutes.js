const express = require('express');
const router = express.Router();
const {
    buscarAutoPorPlaca,
    obtenerEstados,
    obtenerCitas,
    crearCita,
    obtenerCitaPorId,
    actualizarCita,
    eliminarCita,
    obtenerClientesYplaca
    
} = require('../controllers/citasControllers');

router.post('/', crearCita);

// Obtener todas las citas
router.get('/obtener', obtenerCitas);

// Obtener una cita por ID
router.get('/obtener/:id', obtenerCitaPorId);

// Actualizar una cita
router.put('/:id', actualizarCita);

// Eliminar una cita
router.delete('/:id', eliminarCita);

// Buscar automóvil por placa
router.get('/placa/:placa', buscarAutoPorPlaca);

// Obtener lista de estados
router.get('/estados', obtenerEstados);

router.get('/clientesyPlaca', obtenerClientesYplaca);


module.exports = router;
