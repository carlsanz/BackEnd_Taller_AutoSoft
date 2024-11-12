const express = require('express');
const router = express.Router();
const {
    obtenerCitas,
    crearCita,
    obtenerCitaPorId,
    actualizarCita,
    eliminarCita
} = require('../controllers/citasControllers');

router.post('/', crearCita);

// Obtener todas las citas
router.get('/', obtenerCitas);

// Obtener una cita por ID
router.get('/:id', obtenerCitaPorId);

// Actualizar una cita
router.put('/:id', actualizarCita);

// Eliminar una cita
router.delete('/:id', eliminarCita);

module.exports = router;
