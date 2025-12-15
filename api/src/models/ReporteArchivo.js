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
<<<<<<< HEAD
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
=======
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('GETDATE()')
  }
}, {
  tableName: 'ArchivosReportes',
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  timestamps: false
});

module.exports = ReporteArchivo;
