// models/Buyer.js - CORREGIDO
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Persona = require('./Persona');
const Inmueble = require('./Inmueble');
const Sale = require('./Sale'); // USAR Sale en lugar de Venta

const Buyer = sequelize.define('Buyer', {
  id_comprador: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_comprador'
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
  id_venta: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_venta',
    references: {
      model: 'Ventas', // La tabla se llama Ventas
      key: 'id_venta'
    }
  },
  registro_comprador: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'registro_comprador'
  },
  fecha_registro_comprador: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'fecha_registro_comprador'
  },
  fecha_compra: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'fecha_compra'
  },
  valor_compra: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'valor_compra'
  },
  tipo_compra: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Pendiente',
    field: 'tipo_compra',
    validate: {
      isIn: [['Pendiente', 'Directa', 'Financiada', 'Mixta']]
    }
  },
  ciudad_residencia: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'ciudad_residencia'
  },
  direccion_anterior: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'direccion_anterior'
  },
  entidad_financiera: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'entidad_financiera'
  },
  numero_credito: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'numero_credito'
  },
  monto_financiado: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'monto_financiado'
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Activo',
    field: 'estado',
    validate: {
      isIn: [['Activo', 'Inactivo', 'Proceso']]
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
    defaultValue: DataTypes.NOW,
    field: 'fecha_creacion'
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'fecha_actualizacion'
  }
}, {
  tableName: 'Compradores',
  timestamps: false,
  hooks: {
    beforeUpdate: (buyer) => {
      buyer.fecha_actualizacion = new Date();
    }
  }
});

// RELACIONES CORREGIDAS - Usar Sale en lugar de Venta
module.exports = Buyer;
