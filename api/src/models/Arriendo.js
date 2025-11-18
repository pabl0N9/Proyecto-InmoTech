const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Arriendo = sequelize.define('Arriendo', {
  id_arriendo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_arriendo'
  },
  inmueble_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'inmueble_id'
  },
  arrendador_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'arrendador_id'
  },
  arrendatario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'arrendatario_id'
  },
  valor_arriendo: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'valor_arriendo'
  },
  garantia: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'garantia'
  },
  comision: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'comision'
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'fecha_inicio'
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'fecha_fin'
  },
  duracion_meses: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'duracion_meses'
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'estado',
    defaultValue: 'disponible'
  },
  detalles_contrato: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'detalles_contrato'
  },
  incluye_servicios: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'incluye_servicios'
  },
  cita_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'cita_id'
  }
}, {
  tableName: 'Arriendos',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

module.exports = Arriendo;