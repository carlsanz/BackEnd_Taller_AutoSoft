const express = require('express');
const { obtenerServicios, agregarServicio,  actualizarServicio, obtenerServiciosXcita, asociarServicioConCita, obtenerServiciosPorCita, eliminarServicioDeCita } = require('../controllers/servicesController');

const router = express.Router();

router.get('/obtener', obtenerServicios);
router.post('/agregar', agregarServicio);

router.put('/actualizar/:id', actualizarServicio);

router.get('/servxcita' , obtenerServiciosXcita);

router.post('/citas', asociarServicioConCita);

router.get('/citas/disponibles/:id_cita', obtenerServiciosPorCita);

router.delete('/eliminar/:id_cita/:id_servicio', eliminarServicioDeCita);

module.exports = router;
