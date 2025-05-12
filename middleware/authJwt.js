import jwt from "jsonwebtoken"
import authConfig from "../config/auth.config.js"
import { Usuario, Rol } from "../models/index.js"

export const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"] || req.headers.authorization?.split(" ")[1] || req.cookies?.token

  if (!token) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(403).json({ error: "Token no proporcionado" })
    } else {
      return res.redirect('/login')
    }
  }

  jwt.verify(token, authConfig.secret, async (err, decoded) => {
    if (err) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ error: "Token inválido o expirado" })
      } else {
        return res.redirect('/login')
      }
    }

    try {
      const usuario = await Usuario.findByPk(decoded.id, {
        include: {
          model: Rol,
          attributes: ["nombre"],
          through: { attributes: [] }
        }
      })
      
      if (!usuario) {
        if (req.originalUrl.startsWith('/api/')) {
          return res.status(404).json({ error: "Usuario no encontrado" })
        } else {
          return res.redirect('/login')
        }
      }

      req.userId = decoded.id
      req.roles = usuario.Rols.map(rol => rol.nombre)
      
      // Para vistas
      res.locals.user = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        roles: req.roles
      }
      res.locals.isAuthenticated = true
      
      next()
    } catch (error) {
      if (req.originalUrl.startsWith('/api/')) {
        res.status(500).json({ error: "Error al validar token" })
      } else {
        res.redirect('/login')
      }
    }
  })
}

export const isAdmin = (req, res, next) => {
  if (!req.roles?.includes("admin")) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(403).json({ error: "Requiere rol de administrador" })
    } else {
      return res.render('error', { 
        message: 'Acceso denegado', 
        error: 'Se requiere rol de administrador para acceder a esta página' 
      })
    }
  }
  next()
}

export const isModerator = (req, res, next) => {
  if (!req.roles?.includes("admin") && !req.roles?.includes("mod")) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(403).json({ error: "Requiere rol de moderador o administrador" })
    } else {
      return res.render('error', { 
        message: 'Acceso denegado', 
        error: 'Se requiere rol de moderador o administrador para acceder a esta página' 
      })
    }
  }
  next()
}
