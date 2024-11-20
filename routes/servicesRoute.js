const express = require('express');
const { obtenerServicios, agregarServicio, borrarServicio, actualizarServicio, obtenerServiciosXcita, asociarServicioConCita } = require('../controllers/servicesController');

const router = express.Router();

router.get('/obtener', obtenerServicios);
router.post('/agregar', agregarServicio);
router.delete('/borrar/:id', borrarServicio);
router.put('/actualizar/:id', actualizarServicio);

router.get('/servxcita' , obtenerServiciosXcita);

router.post('/citas', asociarServicioConCita);

module.exports = router;
