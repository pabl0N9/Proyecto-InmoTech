const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Persona = sequelize.define('Personas', {
  id_persona: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_persona'
  },
  tipo_documento: {
    type: DataTypes.STRING(5),
    allowNull: false,
    validate: {
      isIn: {
        args: [['CC', 'CE', 'NIT', 'Pasaporte', 'TI']],
        msg: 'Tipo de documento inválido'
      }
    }
  },
  numero_documento: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  nombre_completo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido_completo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  correo: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Correo electrónico inválido'
      }
    }
  },
  telefono: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  tiene_cuenta: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  fecha_registro: {
    type: DataTypes.DATE,
    allowNull: false,
    // IMPORTANTE: No usar DataTypes.NOW en SQL Server
    // El valor se establecerá en el service o en el hook
    defaultValue: sequelize.literal('GETDATE()')  // Usar función nativa de SQL Server
  },
  // REMOVED: id_codeudor field as it doesn't exist in the current database schema
}, {
  tableName: 'Personas',
  timestamps: false,
  hooks: {
    beforeCreate: (persona) => {
      // Asegurar que fecha_registro tenga un valor válido
      if (!persona.fecha_registro) {
        persona.fecha_registro = new Date();
      }
    }
  },
  indexes: [
    {
      unique: true,
      fields: ['tipo_documento', 'numero_documento'],
      name: 'UQ_Persona_Documento'
    },
    {
      fields: ['tipo_documento', 'numero_documento'],
      name: 'IX_Personas_Documento'
    }
  ]
});

module.exports = Persona;
