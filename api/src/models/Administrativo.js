const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Administrativo = sequelize.define('Administrativos', {
  id_administrativo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_administrativo'
  },
  id_persona: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Personas',
      key: 'id_persona'
    }
  },
  codigo_empleado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  fecha_ingreso: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
<<<<<<< HEAD
  cargo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  departamento: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
=======
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  estado_laboral: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Activo',
    validate: {
      isIn: [['Activo', 'Inactivo', 'Suspendido', 'Retirado']]
    }
  },
  fecha_retiro: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Administrativos',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['codigo_empleado'],
      name: 'UQ_Administrativos_CodigoEmpleado'
    },
    {
      fields: ['estado_laboral'],
      name: 'IX_Administrativos_EstadoLaboral'
    }
  ]
});

module.exports = Administrativo;
