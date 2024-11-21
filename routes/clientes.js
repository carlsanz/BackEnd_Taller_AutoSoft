const express = require('express');
const { obtenerDepartamentos,
    agregarCliente,
    buscarClientePorIdentidad,
    actualizarCliente,
    eliminarCliente,
    ObtenerEmpleadosId,
    obtenerTodosLosClientes} = require('../controllers/clientesController');


const router = express.Router();

//ruta para agregar cliente
router.post('/clientes', agregarCliente);

//ruta para obtener departamentos
router.get('/departamentos', obtenerDepartamentos);

//ruta para buscar cliente por identidad
router.get('/clientes/:identidad', buscarClientePorIdentidad);

//ruta para actualizar cliente
router.put('/clientes/:identidad', actualizarCliente);

//ruta para eliminar cliente 
router.delete('/clientes/:identidad', eliminarCliente);

router.get('/todos',obtenerTodosLosClientes);

router.get('/clientes/:id', ObtenerEmpleadosId);


module.exports = router;