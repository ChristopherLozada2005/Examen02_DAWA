import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'bd_Farmacia',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false // Para evitar logs innecesarios en producción
  }
);

// Verificar conexión
try {
  await sequelize.authenticate();
  console.log('Conexión a MySQL establecida correctamente.');
} catch (error) {
  console.error('Error al conectar a MySQL:', error);
}

export default sequelize;