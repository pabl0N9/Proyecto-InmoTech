const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RubroSeguimiento = sequelize.define('Rubro_Seguimiento', {
  id_seguimiento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_seguimiento'
  },
  id_rubro: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Reporte_Rubro',
      key: 'id_rubro'
    }
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('GETDATE()')
  },
  estado: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['Pendiente', 'En Proceso', 'Completado']]
    }
  },
  id_responsable: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Personas',
      key: 'id_persona'
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'Rubro_Seguimiento',
  timestamps: false
});

module.exports = RubroSeguimiento;
