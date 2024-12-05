const express = require('express');
const router = express.Router();
const empleadosController = require('../controllers/empleadosController');


// Ruta para recuperar los datos de un empleado
router.get('/:id', empleadosController.recuperarYEditarEmpleado);

// Ruta para editar los datos de un empleado
router.put('/:id', empleadosController.recuperarYEditarEmpleado);





// Ruta para eliminar un empleado
router.delete('/eliminar/:id', empleadosController.eliminarEmpleado);

module.exports = router;
