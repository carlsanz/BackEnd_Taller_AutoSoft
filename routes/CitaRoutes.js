const express = require('express');
const router = express.Router();
const {
    buscarAutoPorPlaca,
    obtenerEstados,
    obtenerCitas,
    crearCita,
    obtenerCitasPorMecanico,
    actualizarCita,
    eliminarCita,
    obtenerClientesYplaca,
    actualizarEstadoCita,
    actualizarFechaCita,
    obtenerCitasporEmpleado,
    obtenerCitasPorFecha,
    obtenerEstadosCitas
    
} = require('../controllers/citasControllers');

router.post('/', crearCita);

// Obtener todas las citas
router.get('/obtener', obtenerCitas);

// Obtener una cita por ID
router.get('/mecanico/:nombre', obtenerCitasPorMecanico);

// Actualizar una cita
router.put('/:id', actualizarCita);

// Eliminar una cita
router.delete('/:id', eliminarCita);

// Buscar automóvil por placa
router.get('/placa/:placa', buscarAutoPorPlaca);

// Obtener lista de estados
router.get('/estados', obtenerEstados);

router.get('/clientesyPlaca', obtenerClientesYplaca);

// Actualizar los estados de las citas
router.put('/actEstado/:id', actualizarEstadoCita);

//Actualizar fecha de las citas
router.put('/actFecha/:id', actualizarFechaCita);

router.get('/obtener/cita/:idEmpleado', obtenerCitasporEmpleado);

router.get('/fecha/:fecha', obtenerCitasPorFecha );



router.get('/citasEstados', obtenerEstadosCitas);



module.exports = router;
