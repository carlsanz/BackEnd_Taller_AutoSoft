const express = require('express');
const { obtenerColonias,
    agregarCliente,
    buscarClientePorIdentidad,
    actualizarCliente,
    eliminarCliente} = require('../controllers/clientesController');


const router = express.Router();

//ruta para agregar cliente
router.post('/clientes', agregarCliente);

//ruta para obtener colonias
router.get('/colonias', obtenerColonias);

//ruta para buscar cliente por identidad
router.get('/clientes/:identidad', buscarClientePorIdentidad);

//ruta para actualizar cliente
router.put('/clientes/:identidad', actualizarCliente);

//ruta para eliminar cliente 
router.delete('/clientes/:identidad', eliminarCliente);


module.exports = router;