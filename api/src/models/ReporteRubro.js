const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReporteRubro = sequelize.define('Reporte_Rubro', {
  id_rubro: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_rubro'
  },
  id_reporte: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Reportes',
      key: 'id_reporte'
    }
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Reporte_Rubro',
  timestamps: false
});

module.exports = ReporteRubro;
