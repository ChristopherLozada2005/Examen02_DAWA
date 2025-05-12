import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import { Usuario, Rol } from "./models/index.js"
import sequelize from "./config/database.js"

dotenv.config()

const createAdmin = async () => {
  try {
    await sequelize.authenticate()
    console.log("Conexión a la base de datos establecida.")

    let usuario = await Usuario.findOne({ where: { email: "admin@farmacia.com" }, include: Rol })
    let rolAdmin = await Rol.findOne({ where: { nombre: "admin" } })

    if (!rolAdmin) {
      console.log("El rol 'admin' no existe. Creando roles...")
      await Rol.bulkCreate([{ nombre: "user" }, { nombre: "admin" }, { nombre: "mod" }])
      rolAdmin = await Rol.findOne({ where: { nombre: "admin" } })
    }

    if (usuario) {
      // Verifica si ya tiene el rol admin
      const rolesUsuario = usuario.Rols ? usuario.Rols.map((r) => r.nombre) : []
      if (!rolesUsuario.includes("admin")) {
        await usuario.setRols([rolAdmin]) // Puedes usar addRoles si quieres mantener otros roles
        console.log("Rol 'admin' asignado al usuario existente.")
      } else {
        console.log("El usuario admin ya tiene el rol 'admin'.")
      }
      return
    }

    // Si no existe, lo crea y le asigna el rol admin
    const hashedPassword = bcrypt.hashSync("admin123", 8)
    usuario = await Usuario.create({
      nombre: "Administrador",
      email: "admin@farmacia.com",
      password: hashedPassword,
    })

    await usuario.setRols([rolAdmin])
    console.log("Usuario administrador creado exitosamente:")
    console.log("Email: admin@farmacia.com")
    console.log("Contraseña: admin123")
  } catch (error) {
    console.error("Error al crear el administrador:", error)
  }
}

export default createAdmin
