import express from "express"
import {
  createDetalle,
  getDetalleById,
  getAllDetalles,
  getDetallesByMedicamento,
  updateDetalle,
  deleteDetalle,
} from "../controllers/detalle.controller.js"
import { verifyToken } from "../middleware/authJwt.js"

const router = express.Router()

router.post("/", verifyToken, createDetalle)
router.get("/", getAllDetalles)
router.get("/:id", getDetalleById)
router.get("/medicamento/:medicamentoId", getDetallesByMedicamento)
router.put("/:id", verifyToken, updateDetalle)
router.delete("/:id", verifyToken, deleteDetalle)

export default router
