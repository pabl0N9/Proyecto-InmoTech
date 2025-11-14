const { Op } = require('sequelize');
const { Renant, Persona, Inmueble } = require('../models');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

const PERSONA_ATTRIBUTES = [
  'id_persona',
  'nombre_completo',
  'apellido_completo',
  'tipo_documento',
  'numero_documento',
  'correo',
  'telefono'
];

const INMUEBLE_ATTRIBUTES = [
  'id_inmueble',
  'registro_inmobiliario',
  'direccion',
  'ciudad',
  'departamento',
  'estado'
];

class RenantService {
  buildInclude(personaWhere = {}) {
    const personaInclude = {
      association: 'persona',
      attributes: PERSONA_ATTRIBUTES
    };

    if (personaWhere && Object.keys(personaWhere).length) {
      personaInclude.where = personaWhere;
      personaInclude.required = true;
    }

    return [
      personaInclude,
      {
        association: 'inmueble',
        attributes: INMUEBLE_ATTRIBUTES
      }
    ];
  }

  normalizeRenant(renantInstance) {
    if (!renantInstance) return null;

    const persona = renantInstance.persona
      ? {
          id_persona: renantInstance.persona.id_persona,
          nombre_completo: renantInstance.persona.nombre_completo,
          apellido_completo: renantInstance.persona.apellido_completo,
          tipo_documento: renantInstance.persona.tipo_documento,
          numero_documento: renantInstance.persona.numero_documento,
          correo: renantInstance.persona.correo,
          telefono: renantInstance.persona.telefono
        }
      : null;

    const inmueble = renantInstance.inmueble
      ? {
          id_inmueble: renantInstance.inmueble.id_inmueble,
          registro_inmobiliario: renantInstance.inmueble.registro_inmobiliario,
          direccion: renantInstance.inmueble.direccion,
          ciudad: renantInstance.inmueble.ciudad,
          departamento: renantInstance.inmueble.departamento,
          estado: renantInstance.inmueble.estado
        }
      : null;

    return {
      id_renant: renantInstance.id_arrendatario,
      id_persona: renantInstance.id_persona,
      id_inmueble: renantInstance.id_inmueble,
      id_arrendamiento: renantInstance.id_arrendamiento,
      registro_arrendatario: renantInstance.registro_arrendatario,
      estado: renantInstance.estado,
      status: renantInstance.estado,
      fecha_inicio_arrendamiento: renantInstance.fecha_inicio_arrendamiento,
      fecha_fin_arrendamiento: renantInstance.fecha_fin_arrendamiento,
      valor_arriendo_mensual: renantInstance.valor_arriendo_mensual,
      tipo_garantia: renantInstance.tipo_garantia,
      valor_garantia: renantInstance.valor_garantia,
      descripcion_garantia: renantInstance.descripcion_garantia,
      contacto_emergencia: {
        nombre: renantInstance.contacto_emergencia_nombre,
        telefono: renantInstance.contacto_emergencia_telefono,
        parentesco: renantInstance.contacto_emergencia_parentesco
      },
      observaciones: renantInstance.observaciones,
      fecha_registro_arrendatario: renantInstance.fecha_registro_arrendatario,
      fecha_creacion: renantInstance.fecha_creacion,
      fecha_actualizacion: renantInstance.fecha_actualizacion,
      persona,
      inmueble
    };
  }

  async generateRenantCode(transaction) {
    const total = await Renant.count({ transaction });
    return `ARREN-${String(total + 1).padStart(4, '0')}`;
  }

  async ensureInmuebleExists(idInmueble, transaction) {
    const inmueble = await Inmueble.findByPk(idInmueble, { transaction });
    if (!inmueble) {
      throw new Error('Inmueble no encontrado');
    }
    return inmueble;
  }

  async upsertPersona(personaData, transaction) {
    const [persona, created] = await Persona.findOrCreate({
      where: {
        tipo_documento: personaData.tipo_documento,
        numero_documento: personaData.numero_documento
      },
      defaults: {
        tipo_documento: personaData.tipo_documento,
        numero_documento: personaData.numero_documento,
        nombre_completo: personaData.nombre_completo,
        apellido_completo: personaData.apellido_completo,
        correo: personaData.correo,
        telefono: personaData.telefono,
        tiene_cuenta: false,
        estado: true
      },
      transaction
    });

    if (!created) {
      await persona.update(
        {
          nombre_completo: personaData.nombre_completo ?? persona.nombre_completo,
          apellido_completo: personaData.apellido_completo ?? persona.apellido_completo,
          correo: personaData.correo ?? persona.correo,
          telefono: personaData.telefono ?? persona.telefono
        },
        { transaction }
      );
    }

    return persona;
  }

  async getRenantInstanceById(id, transaction = null) {
    return Renant.findByPk(id, {
      include: this.buildInclude(),
      transaction
    });
  }

  async createRenant(renantData) {
    const transaction = await sequelize.transaction();
    try {
      const persona = await this.upsertPersona(renantData, transaction);
      await this.ensureInmuebleExists(renantData.id_inmueble, transaction);

      const existingRenant = await Renant.findOne({
        where: { id_persona: persona.id_persona },
        transaction
      });

      if (existingRenant) {
        throw new Error('Esta persona ya esta registrada como arrendatario');
      }

      const registro =
        renantData.registro_arrendatario || (await this.generateRenantCode(transaction));

      const newRenant = await Renant.create(
        {
          id_persona: persona.id_persona,
          id_inmueble: renantData.id_inmueble,
          id_arrendamiento: renantData.id_arrendamiento ?? null,
          registro_arrendatario: registro,
          fecha_inicio_arrendamiento: renantData.fecha_inicio_arrendamiento,
          fecha_fin_arrendamiento: renantData.fecha_fin_arrendamiento ?? null,
          valor_arriendo_mensual: renantData.valor_arriendo_mensual,
          tipo_garantia: renantData.tipo_garantia ?? null,
          valor_garantia: renantData.valor_garantia ?? null,
          descripcion_garantia: renantData.descripcion_garantia ?? null,
          contacto_emergencia_nombre: renantData.contacto_emergencia_nombre ?? null,
          contacto_emergencia_telefono: renantData.contacto_emergencia_telefono ?? null,
          contacto_emergencia_parentesco: renantData.contacto_emergencia_parentesco ?? null,
          observaciones: renantData.observaciones ?? null,
          estado: renantData.estado || 'Activo'
        },
        { transaction }
      );

      await transaction.commit();
      const renantInstance = await this.getRenantInstanceById(newRenant.id_arrendatario);
      return this.normalizeRenant(renantInstance);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getRenantById(id) {
    const renant = await this.getRenantInstanceById(id);
    if (!renant) {
      throw new Error('Arrendatario no encontrado');
    }
    return this.normalizeRenant(renant);
  }

  async getAllRenants(filters = {}) {
    try {
      logger.info(`Consultando arrendatarios con filtros: ${JSON.stringify(filters)}`);

      const whereClause = {};
      if (filters.status) whereClause.estado = filters.status;
      if (filters.tipo_garantia) whereClause.tipo_garantia = filters.tipo_garantia;
      if (filters.id_inmueble) whereClause.id_inmueble = filters.id_inmueble;
      if (filters.fecha_inicio && filters.fecha_fin) {
        whereClause.fecha_inicio_arrendamiento = {
          [Op.between]: [filters.fecha_inicio, filters.fecha_fin]
        };
      }

      const personaWhere = {};
      if (filters.tipo_documento) personaWhere.tipo_documento = filters.tipo_documento;
      if (filters.numero_documento) personaWhere.numero_documento = filters.numero_documento;

      const renants = await Renant.findAll({
        where: whereClause,
        include: this.buildInclude(personaWhere),
        order: [['fecha_creacion', 'DESC']],
        logging: false
      });

      logger.info(`${renants.length} arrendatarios obtenidos exitosamente`);
      return renants.map((renant) => this.normalizeRenant(renant));
    } catch (error) {
      logger.error(`Error en getAllRenants: ${error.message}`);
      throw error;
    }
  }

  async updateRenant(id, updateData) {
    const transaction = await sequelize.transaction();
    try {
      const renant = await this.getRenantInstanceById(id, transaction);

      if (!renant) {
        throw new Error('Arrendatario no encontrado');
      }

      if (updateData.id_inmueble) {
        await this.ensureInmuebleExists(updateData.id_inmueble, transaction);
      }

      if (renant.persona && (
        updateData.nombre_completo ||
        updateData.apellido_completo ||
        updateData.correo ||
        updateData.telefono
      )) {
        await renant.persona.update(
          {
            nombre_completo: updateData.nombre_completo ?? renant.persona.nombre_completo,
            apellido_completo: updateData.apellido_completo ?? renant.persona.apellido_completo,
            correo: updateData.correo ?? renant.persona.correo,
            telefono: updateData.telefono ?? renant.persona.telefono
          },
          { transaction }
        );
      }

      const renantFields = [
        'id_inmueble',
        'id_arrendamiento',
        'fecha_inicio_arrendamiento',
        'fecha_fin_arrendamiento',
        'valor_arriendo_mensual',
        'tipo_garantia',
        'valor_garantia',
        'descripcion_garantia',
        'contacto_emergencia_nombre',
        'contacto_emergencia_telefono',
        'contacto_emergencia_parentesco',
        'observaciones',
        'estado'
      ];

      const payload = {};
      renantFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(updateData, field)) {
          payload[field] = updateData[field];
        }
      });

      if (Object.keys(payload).length) {
        await renant.update(payload, { transaction });
      }

      await transaction.commit();
      return this.getRenantById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deactivateRenant(id) {
    return this.updateRenant(id, { estado: 'Inactivo' });
  }

  async searchRenants(criteria = {}) {
    try {
      const whereClause = {};
      if (criteria.status) whereClause.estado = criteria.status;
      if (criteria.tipo_garantia) whereClause.tipo_garantia = criteria.tipo_garantia;
      if (criteria.id_inmueble) whereClause.id_inmueble = criteria.id_inmueble;

      const personaWhere = {};
      if (criteria.tipo_documento) personaWhere.tipo_documento = criteria.tipo_documento;
      if (criteria.numero_documento) personaWhere.numero_documento = criteria.numero_documento;
      if (criteria.nombre) {
        personaWhere.nombre_completo = { [Op.like]: `%${criteria.nombre}%` };
      }

      const renants = await Renant.findAll({
        where: whereClause,
        include: this.buildInclude(personaWhere),
        order: [['fecha_creacion', 'DESC']],
        logging: false
      });

      return renants.map((renant) => this.normalizeRenant(renant));
    } catch (error) {
      logger.error(`Error en searchRenants: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new RenantService();
