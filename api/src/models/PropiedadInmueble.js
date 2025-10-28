const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PropiedadInmueble = sequelize.define('Propiedad_inmueble', {
  id_propietario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_propietario'
  },
  id_inmueble: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Inmuebles',
      key: 'id_inmueble'
    }
  },
  id_persona: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Personas',
      key: 'id_persona'
    }
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Activo'
  }
}, {
  tableName: 'Propiedad_inmueble',
  timestamps: false
});

module.exports = PropiedadInmueble;
