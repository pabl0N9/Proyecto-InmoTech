const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reporte = sequelize.define('Reportes', {
  id_reporte: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_reporte'
  },
  id_inmueble: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Inmuebles',
      key: 'id_inmueble'
    }
  },
  tipo_reporte: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Pendiente',
    validate: {
      isIn: [['Pendiente', 'En Proceso', 'Completado', 'Cancelado']]
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('GETDATE()')
  },
  id_responsable: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Personas',
      key: 'id_persona'
    }
  },
  seguimiento_general: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  id_persona_reporta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Personas',
      key: 'id_persona'
    }
  },
  fecha_modificacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('GETDATE()')
  }
}, {
  tableName: 'Reportes',
  timestamps: false
});

module.exports = Reporte;
