const express = require('express');
const router = express.Router();
const {
    obtenerRepuestos,
    crearRepuesto,
    actualizarRepuesto,
    eliminarRepuesto,
    buscarRepuestoPorNombre,
    obtenerProveedores,
    obtenerMarcasRepuestos
} = require('../controllers/RepuestosControllers');



router.get('/', obtenerRepuestos);

// Ruta para crear un nuevo repuesto
router.post('/', crearRepuesto);

// Ruta para actualizar un repuesto por ID
router.put('/:id', actualizarRepuesto);

// Ruta para eliminar un repuesto por ID
router.delete('/:id', eliminarRepuesto);

// Ruta para buscar un repuesto por nombre
router.get('/buscar/:nombre', buscarRepuestoPorNombre);

// Ruta para obtener la lista de proveedores
router.get('/proveedores', obtenerProveedores);

// Ruta para obtener la lista de marcas de repuestos
router.get('/marcas', obtenerMarcasRepuestos);

module.exports = router;
