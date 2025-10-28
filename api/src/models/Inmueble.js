const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Inmueble = sequelize.define('Inmuebles', {
  id_inmueble: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_inmueble'
  },
  registro_inmobiliario: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  pais: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  departamento: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  ciudad: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  barrio: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  direccion: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'Inmuebles',
  timestamps: false
});

module.exports = Inmueble;
