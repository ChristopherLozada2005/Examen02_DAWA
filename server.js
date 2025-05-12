import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import sequelize from "./config/database.js"
import { initRoles } from "./models/index.js"
import authRoutes from "./routes/auth.routes.js"
import medicamentoRoutes from "./routes/medicamento.routes.js"
import detalleRoutes from "./routes/detalleordencompra.routes.js"
import viewRoutes from "./routes/view.routes.js"
import cookieParser from "cookie-parser"
import createAdmin from "./create-admin.js"


dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Después de las líneas de configuración de cors y express
app.use(cookieParser())

// Configurar EJS
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname, "public")))

// Middleware para pasar el usuario a todas las vistas
app.use(async (req, res, next) => {
  res.locals.user = null
  res.locals.isAuthenticated = false
  next()
})

// Rutas de API
app.use("/api/auth", authRoutes)
app.use("/api/medicamentos", medicamentoRoutes)
app.use("/api/detalles", detalleRoutes)

// Rutas de vistas
app.use("/", viewRoutes)

createAdmin()

async function initializeDatabase() {
  try {
    await sequelize.sync({ alter: true })
    console.log("Base de datos sincronizada")
    await initRoles()
    await createAdmin()
  } catch (error) {
    console.error("Error al sincronizar base de datos:", error)
  }
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`)
  initializeDatabase()
})
