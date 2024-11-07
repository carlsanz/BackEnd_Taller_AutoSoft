const express = require("express");
const router = express.Router();
const { agregarInventario, getMarcasYProveedores, obtenerRepuestos, obtenerInventario, actualizarInventario, eliminarInventario } = require("../controllers/inventoryController");

router.get("/inventario", obtenerInventario);
router.get("/marcas-proveedores", getMarcasYProveedores);
router.get("/repuestos", obtenerRepuestos);
router.post("/inventarios", agregarInventario);
router.put('/inventario/:id', actualizarInventario);
router.delete('/inventario/:id', eliminarInventario);

module.exports = router;
