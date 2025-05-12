export default {
  secret: process.env.JWT_SECRET || "clave_secreta_farmacia_2025",
  expiresIn: "24h" // Token expira en 24 horas
};