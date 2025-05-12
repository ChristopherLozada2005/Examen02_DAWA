import Medicamento from "./medicamento.js"
import DetalleOrdenCompra from "./detalleordencompra.js"
import Usuario from "./usuario.js"
import Rol from "./rol.js"

// Relación Medicamento-Detalle
Medicamento.hasMany(DetalleOrdenCompra, { foreignKey: "CodMedicamento" })
DetalleOrdenCompra.belongsTo(Medicamento, { foreignKey: "CodMedicamento" })

// Relación Usuario-Rol (muchos a muchos)
Usuario.belongsToMany(Rol, {
  through: "usuario_roles",
  foreignKey: "usuarioId",
  otherKey: "rolId",
  timestamps: false,
})

Rol.belongsToMany(Usuario, {
  through: "usuario_roles",
  foreignKey: "rolId",
  otherKey: "usuarioId",
  timestamps: false,
})

// Función para inicializar roles
export const initRoles = async () => {
  try {
    const count = await Rol.count()
    if (count === 0) {
      await Rol.bulkCreate([
        { nombre: "user" }, 
        { nombre: "admin" }, 
        { nombre: "mod" }
      ])
      console.log("Roles creados correctamente")
    }
  } catch (error) {
    console.error("Error al crear roles:", error)
  }
}

export { Usuario, Rol, Medicamento, DetalleOrdenCompra }
