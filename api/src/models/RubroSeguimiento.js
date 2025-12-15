const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

<<<<<<< HEAD
const RubroSeguimiento = sequelize.define('Rubro_Seguimiento', {
  id_seguimiento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_seguimiento'
=======
const RubroSeguimiento = sequelize.define('RubroSeguimiento', {
  id_seguimiento_rubro: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_seguimiento_rubro'
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  },
  id_rubro: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
<<<<<<< HEAD
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
=======
      model: 'RubrosReportes',
      key: 'id_rubro'
    }
  },
  id_persona: {
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
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
<<<<<<< HEAD
  }
}, {
  tableName: 'Rubro_Seguimiento',
=======
  },
  estado: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['Pendiente', 'En Proceso', 'Completado', 'Cancelado']]
    }
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('GETDATE()')
  }
}, {
  tableName: 'SeguimientoRubro',
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  timestamps: false
});

module.exports = RubroSeguimiento;
