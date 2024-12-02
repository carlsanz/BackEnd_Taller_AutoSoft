const express = require('express');
const { generarFactura } = require('../controllers/facturaControllers');
const router = express.Router();

// Ruta para generar la factura
router.post('/generar/:Id_cita', generarFactura);



module.exports = router;