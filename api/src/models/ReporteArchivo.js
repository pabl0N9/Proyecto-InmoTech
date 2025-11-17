const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReporteArchivo = sequelize.define('ReporteArchivo', {
  id_archivo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_archivo'
  },
  id_reporte: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Reportes',
      key: 'id_reporte'
    }
  },
  url_archivo: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Reporte_Archivo',
  timestamps: false
});

module.exports = ReporteArchivo;
