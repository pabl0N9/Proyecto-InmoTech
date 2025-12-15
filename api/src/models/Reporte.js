const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reporte = sequelize.define('Reportes', {
  id_reporte: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_reporte'
  },
<<<<<<< HEAD
  tipo_reporte: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['CITAS_POR_FECHA', 'CITAS_POR_AGENTE', 'CITAS_POR_ESTADO', 'CITAS_POR_INMUEBLE', 'RENDIMIENTO_AGENTE']]
    }
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false
=======
  id_inmueble: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipo_reporte: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: true
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
<<<<<<< HEAD
  parametros: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  datos: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  id_generado_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Personas',
      key: 'id_persona'
    }
  },
  fecha_generacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('GETDATE()')
=======
  prioridad: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Pendiente',
    validate: {
      isIn: [['Pendiente', 'En Proceso', 'Completado', 'Cancelado']]
    }
  },
  id_persona_reporta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('GETDATE()')
  },
  fecha_resolucion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  observaciones_resolucion: {
    type: DataTypes.TEXT,
    allowNull: true
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  }
}, {
  tableName: 'Reportes',
  timestamps: false
});

module.exports = Reporte;
