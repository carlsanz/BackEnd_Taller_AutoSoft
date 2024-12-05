const express = require('express');
const { generarFactura, obtenerFacturasSiEsMecanico, obtenerFacturasSiEsAdministrador, eliminarFactura } = require('../controllers/facturaControllers');
const router = express.Router();

// Ruta para generar la factura
router.post('/generar/:Id_cita', generarFactura);

router.get('/Mecanico/:Id_empleado', obtenerFacturasSiEsMecanico);

router.get('/admin/:Id_empleado', obtenerFacturasSiEsAdministrador);

router.delete('/eliminarFactura/:Id_cita', eliminarFactura)



module.exports = router;