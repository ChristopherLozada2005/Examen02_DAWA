import express from "express"
import { verifyToken, isAdmin, isModerator } from "../middleware/authJwt.js"
import { signup, signin, logout } from "../controllers/auth.controller.js"
import { 
  getAllMedicamentos, 
  getMedicamentoById, 
  getEditMedicamento,
  createMedicamento, 
  updateMedicamento, 
  deleteMedicamento,
  searchMedicamentos
} from "../controllers/medicamento.controller.js"
import { 
  getAllDetalles, 
  getDetalleById, 
  getEditDetalle,
  getCreateDetalle,
  createDetalle, 
  updateDetalle, 
  deleteDetalle,
  getDetallesByMedicamento,
  realizarCompra,
  confirmarCompra
} from "../controllers/detalle.controller.js"

const router = express.Router()

// Rutas de autenticación
router.get("/", (req, res) => res.redirect("/login"))
router.get("/login", (req, res) => res.render("login", { message: req.query.registered ? "Usuario registrado exitosamente" : null }))
router.post("/login", signin)
router.get("/register", (req, res) => res.render("register"))
router.post("/register", signup)
router.get("/logout", logout)

// Dashboard
router.get("/dashboard", verifyToken, (req, res) => {
  res.render("dashboard")
})

// Rutas de medicamentos
router.get("/medicamentos", verifyToken, getAllMedicamentos)
router.get("/medicamentos/search", verifyToken, searchMedicamentos)
router.get("/medicamentos/create", verifyToken, isAdmin, (req, res) => res.render("medicamentos/create", { medicamento: {} }))
router.post("/medicamentos/create", verifyToken, isAdmin, createMedicamento)
router.get("/medicamentos/:id", verifyToken, getMedicamentoById)
router.get("/medicamentos/:id/edit", verifyToken, isModerator, getEditMedicamento)
router.post("/medicamentos/:id/edit", verifyToken, isModerator, updateMedicamento)
router.get("/medicamentos/:id/delete", verifyToken, isAdmin, (req, res) => {
  res.render("medicamentos/delete", { id: req.params.id })
})
router.post("/medicamentos/:id/delete", verifyToken, isAdmin, deleteMedicamento)

// Rutas de detalles
router.get("/detalles", verifyToken, getAllDetalles)
router.get("/detalles/create", verifyToken, isAdmin, getCreateDetalle)
router.post("/detalles/create", verifyToken, isAdmin, createDetalle)
router.get("/detalles/medicamento/:medicamentoId", verifyToken, getDetallesByMedicamento)
router.get("/detalles/:id", verifyToken, getDetalleById)
router.get("/detalles/:id/edit", verifyToken, isModerator, getEditDetalle)
router.post("/detalles/:id/edit", verifyToken, isModerator, updateDetalle)
router.get("/detalles/:id/delete", verifyToken, isAdmin, (req, res) => {
  res.render("detalles/delete", { id: req.params.id })
})
router.post("/detalles/:id/delete", verifyToken, isAdmin, deleteDetalle)

// Rutas de compras (para usuarios normales)
router.get("/compras/realizar", verifyToken, async (req, res) => {
  const Medicamento = (await import("../models/medicamento.js")).default
  const medicamentos = await Medicamento.findAll()
  res.render("compras/realizar", { medicamentos, compra: {} })
})
router.post("/compras/realizar", verifyToken, realizarCompra)
router.get("/compras/confirmacion/:id", verifyToken, confirmarCompra)

// Ruta de error
router.get("/error", (req, res) => {
  res.render("error", { 
    message: req.query.message || "Error", 
    error: req.query.error || "Ha ocurrido un error" 
  })
})

export default router
