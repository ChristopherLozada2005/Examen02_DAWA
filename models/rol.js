import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Rol = sequelize.define(
  "Rol",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "roles",
  },
)

export default Rol
