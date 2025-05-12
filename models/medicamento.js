import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Medicamento = sequelize.define(
  "Medicamento",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    descripcionMed: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    fechaFabricacion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaVencimiento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    Presentacion: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    precioVentaUni: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    precioVentaPres: {
      type: DataTypes.DECIMAL(10, 2),
      validate: { min: 0 },
    },
    CodTipoMed: {
      type: DataTypes.INTEGER,
    },
    Marca: {
      type: DataTypes.STRING(50),
    },
    CodEscpec: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: true,
    tableName: "medicamentos",
  },
)

export default Medicamento
