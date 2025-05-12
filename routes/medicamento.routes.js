import express from "express"
import {
  createMedicamento,
  getAllMedicamentos,
  getMedicamentoById,
  searchMedicamentos,
  updateMedicamento,
  deleteMedicamento,
} from "../controllers/medicamento.controller.js"
import { verifyToken } from "../middleware/authJwt.js"

const router = express.Router()

router.post("/", verifyToken, createMedicamento)
router.get("/", getAllMedicamentos)
router.get("/search", searchMedicamentos)
router.get("/:id", getMedicamentoById)
router.put("/:id", verifyToken, updateMedicamento)
router.delete("/:id", verifyToken, deleteMedicamento)

export default router
