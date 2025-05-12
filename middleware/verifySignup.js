import { Usuario, Rol } from '../models/index.js';

// Exporta como funciones nombradas (sin el export default al final)
export const checkDuplicateEmail = async (req, res, next) => {
  try {
    const usuario = await Usuario.findOne({ where: { email: req.body.email } });
    if (usuario) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    const validRoles = ['admin', 'moderator', 'user'];
    for (const role of req.body.roles) {
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          error: `Rol inválido: ${role}. Roles válidos: ${validRoles.join(', ')}`
        });
      }
    }
  }
  next();
};
