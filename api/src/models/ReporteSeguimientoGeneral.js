const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

<<<<<<< HEAD
const ReporteSeguimientoGeneral = sequelize.define('Reporte_Seguimiento_General', {
=======
const ReporteSeguimientoGeneral = sequelize.define('ReporteSeguimientoGeneral', {
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  id_seguimiento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_seguimiento'
  },
  id_reporte: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Reportes',
      key: 'id_reporte'
    }
  },
<<<<<<< HEAD
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
  tableName: 'Reporte_Seguimiento_General',
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
  tableName: 'SeguimientosReportes',
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  timestamps: false
});

module.exports = ReporteSeguimientoGeneral;
