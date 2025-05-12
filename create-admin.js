import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import { Usuario, Rol } from "./models/index.js"
import sequelize from "./config/database.js"

dotenv.config()

const createAdmin = async () => {
  try {
    await sequelize.authenticate()
    console.log("Conexión a la base de datos establecida.")

    const existingUser = await Usuario.findOne({ where: { email: "admin@farmacia.com" } })
    if (existingUser) {
      console.log("Ya existe un usuario con este email.")
      return
    }

    const hashedPassword = bcrypt.hashSync("admin123", 8)
    const usuario = await Usuario.create({
      nombre: "Administrador",
      email: "admin@farmacia.com",
      password: hashedPassword,
    })

    console.log("Usuario creado con ID:", usuario.id)

    let rolAdmin = await Rol.findOne({ where: { nombre: "admin" } })
    if (!rolAdmin) {
      console.log("El rol 'admin' no existe. Creando roles...")
      await Rol.bulkCreate([{ nombre: "user" }, { nombre: "admin" }, { nombre: "mod" }])
      rolAdmin = await Rol.findOne({ where: { nombre: "admin" } })
    }
    await usuario.setRoles([rolAdmin])

    console.log("Usuario administrador creado exitosamente:")
    console.log("Email: admin@farmacia.com")
    console.log("Contraseña: admin123")
  } catch (error) {
    console.error("Error al crear el administrador:", error)
  }
}

export default createAdmin