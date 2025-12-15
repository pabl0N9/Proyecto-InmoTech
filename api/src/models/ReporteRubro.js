const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

<<<<<<< HEAD
const ReporteRubro = sequelize.define('Reporte_Rubro', {
=======
const ReporteRubro = sequelize.define('ReporteRubro', {
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
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
<<<<<<< HEAD
  }
}, {
  tableName: 'Reporte_Rubro',
=======
  },
  estado: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Pendiente',
    validate: {
      isIn: [['Pendiente', 'En Proceso', 'Completado', 'Cancelado']]
    }
  },
  progreso: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('GETDATE()')
  }
}, {
  tableName: 'RubrosReportes',
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  timestamps: false
});

module.exports = ReporteRubro;
