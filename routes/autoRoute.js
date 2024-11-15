const express = require('express');
const router = express.Router();
const { addAuto, updateAutoByPlate, deleteAutoByPlate, getAutoByPlate, verifyClient, getModelos, getTipos, getColores, obtenerAutos } = require('../controllers/autoControllers');

// Definición de las rutas para autos
router.post('/', addAuto);
router.put('/:placa', updateAutoByPlate);
router.delete('/:placa', deleteAutoByPlate);
router.get('/placa/:placa', getAutoByPlate);
router.get('/identidad/:identidad', verifyClient);
router.get('/modelos' , getModelos);
router.get('/tipos' , getTipos);
router.get('/colores' , getColores);
router.get('/todos', obtenerAutos);

module.exports = router;
