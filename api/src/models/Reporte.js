const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reporte = sequelize.define('Reportes', {
  id_reporte: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_reporte'
  },
  tipo_reporte: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['CITAS_POR_FECHA', 'CITAS_POR_AGENTE', 'CITAS_POR_ESTADO', 'CITAS_POR_INMUEBLE', 'RENDIMIENTO_AGENTE']]
    }
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  parametros: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  datos: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  id_generado_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Personas',
      key: 'id_persona'
    }
  },
  fecha_generacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('GETDATE()')
  }
}, {
  tableName: 'Reportes',
  timestamps: false
});

module.exports = Reporte;
