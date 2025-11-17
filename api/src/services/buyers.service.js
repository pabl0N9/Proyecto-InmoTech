const { Op } = require('sequelize');
const { Buyer, Persona, Inmueble } = require('../models');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

const PERSONA_ATTRIBUTES = [
  'id_persona',
  'nombre_completo',
  'apellido_completo',
  'tipo_documento',
  'numero_documento',
  'correo',
  'telefono',
  'fecha_registro',
  'estado'
];

const BUYER_ATTRIBUTES = [
  'id_comprador',
  'id_inmueble',
  'id_venta',
  'registro_comprador',
  'fecha_registro_comprador',
  'fecha_compra',
  'valor_compra',
  'tipo_compra',
  'ciudad_residencia',
  'direccion_anterior',
  'entidad_financiera',
  'numero_credito',
  'monto_financiado',
  'estado',
  'observaciones',
  'fecha_creacion',
  'fecha_actualizacion'
];

const INMUEBLE_ATTRIBUTES = [
  'id_inmueble',
  'registro_inmobiliario',
  'direccion',
  'ciudad',
  'departamento',
  'estado'
];

class BuyerService {
  hasMandatoryPurchaseData(data = {}) {
    return (
      data.id_inmueble !== undefined &&
      data.id_inmueble !== null &&
      data.fecha_compra &&
      data.valor_compra !== undefined &&
      data.valor_compra !== null
    );
  }

  buildPurchasePayload(data = {}) {
    const payload = {};
    if (data.id_inmueble !== undefined) payload.id_inmueble = data.id_inmueble;
    if (data.id_venta !== undefined) payload.id_venta = data.id_venta;
    if (data.fecha_compra) payload.fecha_compra = data.fecha_compra;
    if (data.valor_compra !== undefined) payload.valor_compra = data.valor_compra;
    if (data.tipo_compra) payload.tipo_compra = data.tipo_compra;
    if (data.ciudad_residencia !== undefined) payload.ciudad_residencia = data.ciudad_residencia;
    if (data.direccion_anterior !== undefined) payload.direccion_anterior = data.direccion_anterior;
    if (data.entidad_financiera !== undefined) payload.entidad_financiera = data.entidad_financiera;
    if (data.numero_credito !== undefined) payload.numero_credito = data.numero_credito;
    if (data.monto_financiado !== undefined) payload.monto_financiado = data.monto_financiado;
    if (data.observaciones !== undefined) payload.observaciones = data.observaciones;
    if (data.estado) payload.estado = data.estado;
    return payload;
  }

  async generateBuyerCode(transaction) {
    const total = await Buyer.count({ transaction });
    return `COMP-${String(total + 1).padStart(4, '0')}`;
  }

  async ensureInmuebleExists(idInmueble, transaction) {
    const inmueble = await Inmueble.findByPk(idInmueble, { transaction });
    if (!inmueble) {
      throw new Error('Inmueble no encontrado');
    }
    return inmueble;
  }

  personaQuery(where = {}) {
    return {
      where,
      attributes: PERSONA_ATTRIBUTES,
      include: [
        {
          association: 'buyer',
          attributes: BUYER_ATTRIBUTES,
          include: [
            {
              association: 'inmueble',
              attributes: INMUEBLE_ATTRIBUTES
            }
          ],
          required: false
        }
      ]
    };
  }

  normalizePersonaRecord(personaInstance) {
    if (!personaInstance) return null;

    const buyer = personaInstance.buyer || null;
    const inmueble = buyer?.inmueble
      ? {
          id_inmueble: buyer.inmueble.id_inmueble,
          registro_inmobiliario: buyer.inmueble.registro_inmobiliario,
          direccion: buyer.inmueble.direccion,
          ciudad: buyer.inmueble.ciudad,
          departamento: buyer.inmueble.departamento,
          estado: buyer.inmueble.estado
        }
      : null;

    return {
      id_buyer: buyer ? buyer.id_comprador : null,
      id_persona: personaInstance.id_persona,
      status: buyer ? buyer.estado : personaInstance.estado ? 'Activo' : 'Inactivo',
      registration_date: buyer?.fecha_registro_comprador || personaInstance.fecha_registro,
      id_inmueble: buyer?.id_inmueble || null,
      id_venta: buyer?.id_venta || null,
      registro_comprador: buyer?.registro_comprador || null,
      fecha_compra: buyer?.fecha_compra || null,
      valor_compra: buyer?.valor_compra || null,
      tipo_compra: buyer?.tipo_compra || null,
      ciudad_residencia: buyer?.ciudad_residencia || null,
      direccion_anterior: buyer?.direccion_anterior || null,
      entidad_financiera: buyer?.entidad_financiera || null,
      numero_credito: buyer?.numero_credito || null,
      monto_financiado: buyer?.monto_financiado || null,
      observaciones: buyer?.observaciones || null,
      persona: {
        id_persona: personaInstance.id_persona,
        nombre_completo: personaInstance.nombre_completo,
        apellido_completo: personaInstance.apellido_completo,
        tipo_documento: personaInstance.tipo_documento,
        numero_documento: personaInstance.numero_documento,
        correo: personaInstance.correo,
        telefono: personaInstance.telefono
      },
      compra: buyer
        ? {
            id_inmueble: buyer.id_inmueble,
            id_venta: buyer.id_venta,
            registro_comprador: buyer.registro_comprador,
            fecha_compra: buyer.fecha_compra,
            valor_compra: buyer.valor_compra,
            tipo_compra: buyer.tipo_compra,
            ciudad_residencia: buyer.ciudad_residencia,
            direccion_anterior: buyer.direccion_anterior,
            entidad_financiera: buyer.entidad_financiera,
            numero_credito: buyer.numero_credito,
            monto_financiado: buyer.monto_financiado,
            observaciones: buyer.observaciones,
            estado: buyer.estado
          }
        : null,
      inmueble
    };
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

  async getPersonaWithBuyerById(id, transaction = null) {
    return Persona.findByPk(id, {
      ...this.personaQuery(),
      transaction
    });
  }

  async createBuyer(buyerData) {
    const transaction = await sequelize.transaction();
    try {
      const persona = await this.upsertPersona(buyerData, transaction);

      if (buyerData.id_inmueble) {
        await this.ensureInmuebleExists(buyerData.id_inmueble, transaction);
      }

      const existingBuyer = await Buyer.findOne({
        where: { id_persona: persona.id_persona },
        transaction
      });

      const registro =
        existingBuyer?.registro_comprador ||
        buyerData.registro_comprador ||
        (await this.generateBuyerCode(transaction));

      const basePayload = {
        id_persona: persona.id_persona,
        registro_comprador: registro,
        fecha_registro_comprador:
          buyerData.fecha_registro_comprador ||
          existingBuyer?.fecha_registro_comprador ||
          buyerData.fecha_compra ||
          new Date(),
        tipo_compra: buyerData.tipo_compra || existingBuyer?.tipo_compra || 'Pendiente',
        estado: buyerData.estado || existingBuyer?.estado || 'Activo',
        id_venta: buyerData.id_venta ?? existingBuyer?.id_venta ?? null,
        ...this.buildPurchasePayload(buyerData)
      };

      if (existingBuyer) {
        await existingBuyer.update(basePayload, { transaction });
      } else {
        await Buyer.create(basePayload, { transaction });
      }

      await transaction.commit();
      const personaRecord = await this.getPersonaWithBuyerById(persona.id_persona);
      return this.normalizePersonaRecord(personaRecord);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getBuyerById(id) {
    const persona = await this.getPersonaWithBuyerById(id);
    if (!persona) {
      throw new Error('Comprador no encontrado');
    }
    return this.normalizePersonaRecord(persona);
  }

  async getAllBuyers(filters = {}) {
    try {
      const personaWhere = {};
      const buyerWhere = {};

      if (filters.status) buyerWhere.estado = filters.status;
      if (filters.tipo_compra) buyerWhere.tipo_compra = filters.tipo_compra;
      if (filters.id_inmueble) buyerWhere.id_inmueble = filters.id_inmueble;
      if (filters.tipo_documento) personaWhere.tipo_documento = filters.tipo_documento;
      if (filters.numero_documento) personaWhere.numero_documento = filters.numero_documento;
      if (filters.search && filters.search.trim()) {
        const likeSearch = `%${filters.search.trim().toLowerCase()}%`;
        const personaAlias = Persona.name || (Persona.getTableName?.().as ?? Persona.tableName) || 'Personas';
        const lowerCol = (column) =>
          sequelize.fn('LOWER', sequelize.col(`${personaAlias}.${column}`));

        personaWhere[Op.or] = [
          sequelize.where(lowerCol('nombre_completo'), { [Op.like]: likeSearch }),
          sequelize.where(lowerCol('apellido_completo'), { [Op.like]: likeSearch }),
          sequelize.where(lowerCol('numero_documento'), { [Op.like]: likeSearch })
        ];
      }

      const personaQuery = this.personaQuery(personaWhere);
      const include = personaQuery.include;
      include[0].where = Object.keys(buyerWhere).length ? buyerWhere : undefined;
      include[0].required = false;

      const personas = await Persona.findAll({
        attributes: personaQuery.attributes,
        where: personaWhere,
        include,
        order: [['fecha_registro', 'DESC']],
        logging: false
      });

      return personas.map((persona) => this.normalizePersonaRecord(persona));
    } catch (error) {
      const sqlMessage = error?.parent?.message || error?.original?.message || error.message;
      logger.error(`Error en getAllBuyers: ${sqlMessage || 'sin detalle'}`);
      if (error?.sql) {
        logger.error(`SQL en getAllBuyers: ${error.sql}`);
      }
      throw error;
    }
  }

  async updateBuyer(id, updateData) {
    const transaction = await sequelize.transaction();
    try {
      const persona = await Persona.findByPk(id, { transaction, include: this.personaQuery().include });

      if (!persona) {
        throw new Error('Comprador no encontrado');
      }

      await persona.update(
        {
          nombre_completo: updateData.nombre_completo ?? persona.nombre_completo,
          apellido_completo: updateData.apellido_completo ?? persona.apellido_completo,
          correo: updateData.correo ?? persona.correo,
          telefono: updateData.telefono ?? persona.telefono
        },
        { transaction }
      );

      const purchaseUpdates = this.buildPurchasePayload(updateData);
      const existingBuyer = await Buyer.findOne({
        where: { id_persona: persona.id_persona },
        transaction
      });

      if (updateData.id_inmueble) {
        await this.ensureInmuebleExists(updateData.id_inmueble, transaction);
      } else if (purchaseUpdates.id_inmueble) {
        await this.ensureInmuebleExists(purchaseUpdates.id_inmueble, transaction);
      }

      const shouldPersistPurchase =
        existingBuyer ||
        updateData.estado ||
        updateData.tipo_compra ||
        updateData.id_venta !== undefined ||
        Object.keys(purchaseUpdates).length > 0;

      if (shouldPersistPurchase) {
        const registro =
          existingBuyer?.registro_comprador ||
          updateData.registro_comprador ||
          (await this.generateBuyerCode(transaction));

        const basePayload = {
          registro_comprador: registro,
          fecha_registro_comprador:
            updateData.fecha_registro_comprador ||
            existingBuyer?.fecha_registro_comprador ||
            updateData.fecha_compra ||
            existingBuyer?.fecha_compra ||
            new Date(),
          tipo_compra: updateData.tipo_compra || existingBuyer?.tipo_compra || 'Pendiente',
          estado: updateData.estado || existingBuyer?.estado || 'Activo',
          id_venta: updateData.id_venta ?? existingBuyer?.id_venta ?? null,
          ...purchaseUpdates
        };

        if (existingBuyer) {
          await existingBuyer.update(basePayload, { transaction });
        } else {
          await Buyer.create(
            {
              id_persona: persona.id_persona,
              ...basePayload
            },
            { transaction }
          );
        }
      }

      await transaction.commit();
      const personaRecord = await this.getPersonaWithBuyerById(id);
      return this.normalizePersonaRecord(personaRecord);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deactivateBuyer(id) {
    const transaction = await sequelize.transaction();
    try {
      const persona = await Persona.findByPk(id, { transaction, include: this.personaQuery().include });
      if (!persona) {
        throw new Error('Comprador no encontrado');
      }

      await persona.update({ estado: false }, { transaction });

      if (persona.buyer) {
        await persona.buyer.update({ estado: 'Inactivo' }, { transaction });
      }

      await transaction.commit();
      const personaRecord = await this.getPersonaWithBuyerById(id);
      return this.normalizePersonaRecord(personaRecord);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteBuyer(id) {
    const transaction = await sequelize.transaction();
    try {
      const persona = await Persona.findByPk(id, {
        transaction,
        include: this.personaQuery().include
      });

      if (!persona) {
        throw new Error('Comprador no encontrado');
      }

      const removedSnapshot = this.normalizePersonaRecord(persona);
      const existingBuyer = await Buyer.findOne({
        where: { id_persona: persona.id_persona },
        transaction
      });

      if (existingBuyer) {
        await existingBuyer.destroy({ transaction });
      }

      await Persona.destroy({
        where: { id_persona: persona.id_persona },
        transaction
      });

      await transaction.commit();
      return removedSnapshot;
    } catch (error) {
      await transaction.rollback();
      if (error?.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error(
          'No es posible eliminar este comprador porque tiene información relacionada (ventas, arrendamientos, etc.). Intente desactivarlo.'
        );
      }
      throw error;
    }
  }

  async searchBuyers(criteria = {}) {
    try {
      const personaWhere = {};
      const buyerWhere = {};

      if (criteria.tipo_documento) personaWhere.tipo_documento = criteria.tipo_documento;
      if (criteria.numero_documento) personaWhere.numero_documento = criteria.numero_documento;
      if (criteria.nombre) personaWhere.nombre_completo = { [Op.like]: `%${criteria.nombre}%` };

      if (criteria.status) buyerWhere.estado = criteria.status;
      if (criteria.tipo_compra) buyerWhere.tipo_compra = criteria.tipo_compra;
      if (criteria.id_inmueble) buyerWhere.id_inmueble = criteria.id_inmueble;
      if (criteria.fecha_inicio && criteria.fecha_fin) {
        buyerWhere.fecha_compra = {
          [Op.between]: [criteria.fecha_inicio, criteria.fecha_fin]
        };
      }

      const personaQuery = this.personaQuery(personaWhere);
      const include = personaQuery.include;
      include[0].where = Object.keys(buyerWhere).length ? buyerWhere : undefined;
      include[0].required = false;

      const personas = await Persona.findAll({
        attributes: personaQuery.attributes,
        where: personaWhere,
        include,
        order: [['fecha_registro', 'DESC']],
        logging: false
      });

      return personas.map((persona) => this.normalizePersonaRecord(persona));
    } catch (error) {
      logger.error(`Error en searchBuyers: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new BuyerService();
