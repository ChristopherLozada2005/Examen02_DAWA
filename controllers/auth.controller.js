import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { Usuario, Rol } from "../models/index.js"
import authConfig from "../config/auth.config.js"

export const signup = async (req, res) => {
  try {
    const { nombre, email, password, roles } = req.body
    const hashedPassword = bcrypt.hashSync(password, 8)

    const usuario = await Usuario.create({
      nombre,
      email,
      password: hashedPassword,
    })

    if (roles && roles.length > 0 && req.roles?.includes("admin")) {
      const foundRoles = await Rol.findAll({ where: { nombre: roles } })
      await usuario.setRols(foundRoles)
    } else {
      const defaultRole = await Rol.findOne({ where: { nombre: "user" } })
      await usuario.setRols([defaultRole])
    }

    if (req.originalUrl.startsWith("/api/")) {
      res.status(201).json({ message: "Usuario registrado exitosamente" })
    } else {
      res.redirect("/login?registered=true")
    }
  } catch (error) {
    if (req.originalUrl.startsWith("/api/")) {
      res.status(500).json({ error: error.message })
    } else {
      res.render("register", { error: error.message })
    }
  }
}

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body

    // Verificar que se proporcionaron email y password
    if (!email || !password) {
      if (req.originalUrl.startsWith("/api/")) {
        return res.status(400).json({ error: "Email y contraseña son requeridos" })
      } else {
        return res.render("login", { error: "Email y contraseña son requeridos" })
      }
    }

    // Buscar el usuario
    const usuario = await Usuario.findOne({
      where: { email },
      include: {
        model: Rol,
        attributes: ["nombre"],
        through: { attributes: [] },
      },
    })

    // Verificar si el usuario existe
    if (!usuario) {
      console.log("Usuario no encontrado:", email)
      if (req.originalUrl.startsWith("/api/")) {
        return res.status(401).json({ error: "Email o contraseña incorrectos" })
      } else {
        return res.render("login", { error: "Email o contraseña incorrectos" })
      }
    }

    // Verificar la contraseña
    const passwordIsValid = bcrypt.compareSync(password, usuario.password)
    if (!passwordIsValid) {
      console.log("Contraseña incorrecta para usuario:", email)
      if (req.originalUrl.startsWith("/api/")) {
        return res.status(401).json({ error: "Email o contraseña incorrectos" })
      } else {
        return res.render("login", { error: "Email o contraseña incorrectos" })
      }
    }

    // Obtener roles
    const roles = usuario.Rols.map((role) => role.nombre)

    // Generar token
    const token = jwt.sign({ id: usuario.id, roles }, authConfig.secret, { expiresIn: authConfig.expiresIn })

    // Guardar token en la base de datos
    usuario.token = token
    await usuario.save()

    // Responder según el tipo de solicitud
    if (req.originalUrl.startsWith("/api/")) {
      return res.status(200).json({
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        roles,
        accessToken: token,
      })
    } else {
      // Establecer cookie
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
      })

      console.log("Login exitoso, redirigiendo a dashboard")
      return res.redirect("/dashboard")
    }
  } catch (error) {
    console.error("Error en signin:", error)
    if (req.originalUrl.startsWith("/api/")) {
      return res.status(500).json({ error: error.message })
    } else {
      return res.render("login", { error: "Error al iniciar sesión: " + error.message })
    }
  }
}

export const logout = (req, res) => {
  res.clearCookie("token")
  res.redirect("/login")
}

export const getProfile = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.userId, {
      attributes: { exclude: ["password"] },
      include: {
        model: Rol,
        attributes: ["nombre"],
        through: { attributes: [] },
      },
    })

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" })
    }

    res.status(200).json(usuario)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
