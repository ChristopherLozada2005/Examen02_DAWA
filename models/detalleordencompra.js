import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const DetalleOrdenCompra = sequelize.define(
  "DetalleOrdenCompra",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    NroOrdenC: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CodMedicamento: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    montouni: {
      type: DataTypes.DECIMAL(10, 2),
    },
  },
  {
    timestamps: false,
    tableName: "detalleordencompras",
  },
)

export default DetalleOrdenCompra
