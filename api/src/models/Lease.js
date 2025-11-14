const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// ✅ CORRECTO: Importar desde el mismo directorio sin .model
const Inmueble = require('./Inmueble');  // Cambiar de './Inmueble.model' a './Inmueble'
const Persona = require('./Persona');
const Cita = require('./Cita');

const Lease = sequelize.define('Lease', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  inmueble_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Inmueble',
      key: 'id'
    }
  },
  arrendador_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Persona',
      key: 'id'
    }
  },
  arrendatario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Persona',
      key: 'id'
    }
  },
  cita_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Cita',
      key: 'id'
    }
  },
  precio_arriendo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: false
  },
  deposito: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING(50),
    defaultValue: 'activo'
  }
}, {
  tableName: 'arriendos',
  timestamps: false,
  freezeTableName: true
});

module.exports = Lease;