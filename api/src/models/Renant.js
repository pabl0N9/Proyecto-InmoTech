const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Persona = require('./Persona');
const Inmueble = require('./Inmueble');

const Renant = sequelize.define('Renant', {
  id_arrendatario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_arrendatario'
  },
  id_persona: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_persona',
    references: {
      model: 'Personas',
      key: 'id_persona'
    }
  },
  id_inmueble: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_inmueble',
    references: {
      model: 'Inmuebles',
      key: 'id_inmueble'
    }
  },
  id_arrendamiento: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_arrendamiento'
  },
  registro_arrendatario: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'registro_arrendatario'
  },
  fecha_registro_arrendatario: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: sequelize.literal('GETDATE()'),
    field: 'fecha_registro_arrendatario'
  },
  fecha_inicio_arrendamiento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'fecha_inicio_arrendamiento'
  },
  fecha_fin_arrendamiento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'fecha_fin_arrendamiento'
  },
  valor_arriendo_mensual: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'valor_arriendo_mensual'
  },
  tipo_garantia: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'tipo_garantia',
    validate: {
      isIn: [['Deposito', 'Fiador', 'Seguro', 'Mixta']]
    }
  },
  valor_garantia: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'valor_garantia'
  },
  descripcion_garantia: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'descripcion_garantia'
  },
  contacto_emergencia_nombre: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'contacto_emergencia_nombre'
  },
  contacto_emergencia_telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'contacto_emergencia_telefono'
  },
  contacto_emergencia_parentesco: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'contacto_emergencia_parentesco'
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Activo',
    field: 'estado',
    validate: {
      isIn: [['Activo', 'Inactivo', 'Moroso', 'Proceso']]
    }
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'observaciones'
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('GETDATE()'),
    field: 'fecha_creacion'
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'fecha_actualizacion'
  }
}, {
  tableName: 'Arrendatarios',
  timestamps: false,
  hooks: {
    beforeUpdate: (renant) => {
      renant.fecha_actualizacion = new Date();
    }
  }
});

Renant.belongsTo(Persona, { foreignKey: 'id_persona', as: 'persona' });
Persona.hasOne(Renant, { foreignKey: 'id_persona', as: 'renant' });

Renant.belongsTo(Inmueble, { foreignKey: 'id_inmueble', as: 'inmueble' });
Inmueble.hasMany(Renant, { foreignKey: 'id_inmueble', as: 'arrendatarios' });

module.exports = Renant;
