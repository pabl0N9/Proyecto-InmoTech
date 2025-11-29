const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReporteImagen = sequelize.define('Reporte_Imagen', {
  id_imagen: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_imagen'
  },
  id_reporte: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Reportes',
      key: 'id_reporte'
    }
  },
  url_imagen: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(200),
    allowNull: true
  }
}, {
  tableName: 'Reporte_Imagen',
  timestamps: false
});

module.exports = ReporteImagen;
