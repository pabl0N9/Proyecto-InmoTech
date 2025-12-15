const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

<<<<<<< HEAD
const ReporteImagen = sequelize.define('Reporte_Imagen', {
=======
const ReporteImagen = sequelize.define('ReporteImagen', {
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
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
<<<<<<< HEAD
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
=======
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
  tableName: 'ImagenesReportes',
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  timestamps: false
});

module.exports = ReporteImagen;
