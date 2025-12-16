const { Op } = require("sequelize");
const { Sale, Buyer, Inmueble, Persona, SeguimientoVenta, EstadosVenta } = require('../models');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

class SaleService {
  async createSale(saleData) {
    logger.info(`createSale payload: ${JSON.stringify(saleData)}`);
    const result = await sequelize.transaction(async (t) => {
      try {
        // 1. Validar que el inmueble existe y está disponible
        const inmueble = await Inmueble.findByPk(saleData.id_inmueble, { transaction: t });
        if (!inmueble) {
          throw new Error('Inmueble no encontrado');
        }

        // 2. Validar que el comprador existe (tabla Compradores)
        const compradorId = saleData.id_comprador || saleData.id_persona;
        logger.info(`createSale compradorId=${compradorId} inmuebleId=${saleData.id_inmueble}`);
        const comprador = await Buyer.findByPk(compradorId, { transaction: t, include: ['persona'] });
        if (!comprador) {
          throw new Error('Comprador no encontrado');
        }

        // 2.5. Resolver vendedor (opcional, se guarda id y/o datos congelados si viene)
        let vendedorPersona = null;
        if (saleData.id_vendedor) {
          vendedorPersona = await Persona.findByPk(saleData.id_vendedor, { transaction: t });
          if (!vendedorPersona) {
            throw new Error('Vendedor no encontrado');
          }
        }

        // 3. Crear la venta
        const newSale = await Sale.create({
          id_comprador: compradorId,
          id_inmueble: saleData.id_inmueble,
          fecha_venta: saleData.fecha_venta,
          valor_venta: saleData.valor_venta,
          medio_pago: saleData.medio_pago,
          estado: 'Activa',
          id_vendedor: vendedorPersona?.id_persona || null,
          tipo_doc_vendedor: vendedorPersona?.tipo_documento || saleData.vendedorTipoDocumento || null,
          numero_doc_vendedor: vendedorPersona?.numero_documento || saleData.vendedorDocumento || null,
          nombre_vendedor:
            vendedorPersona?.nombre_completo ||
            saleData.vendedorNombreCompleto ||
            saleData.nombre_vendedor ||
            null,
          correo_vendedor: vendedorPersona?.correo || saleData.vendedorCorreo || null,
          telefono_vendedor: vendedorPersona?.telefono || saleData.vendedorTelefono || null
        }, { transaction: t });

        // 4. Actualizar estado del inmueble a "Vendido" (boolean + label)
        await inmueble.update({
          estado: false, // boolean field
          estado_frontend: 'Vendido'
        }, { transaction: t });

        return await this.getSaleById(newSale.id_venta, t);

      } catch (error) {
        logger.error(`❌ createSale failed: ${error.message}`);
        throw error;
      }
    });

    return result;
  }

  async getSaleById(id, transaction = null) {
    const sale = await Sale.findByPk(id, {
      include: [
        { 
          association: 'inmueble',
          attributes: [
            'id_inmueble',
            'registro_inmobiliario',
            'direccion',
            'ciudad',
            'departamento',
            'categoria',
            'titulo',
            'barrio',
            'pais',
            'precio_venta',
            'area_construida'
          ]
        },
        {
          association: 'vendedor',
          attributes: [
            'id_persona',
            'nombre_completo',
            'apellido_completo',
            'correo',
            'telefono',
            'tipo_documento',
            'numero_documento'
          ]
        },
        { 
          association: 'comprador',
          attributes: ['id_comprador', 'registro_comprador'],
          include: [
            {
              association: 'persona',
              attributes: [
                'id_persona',
                'nombre_completo',
                'apellido_completo',
                'correo',
                'telefono',
                'tipo_documento',
                'numero_documento'
              ]
            }
          ]
        }
      ],
      transaction
    });

    if (!sale) throw new Error('Venta no encontrada');

    return sale;
  }

  async getAllSales(filters = {}) {
    try {
      logger.info(`🔍 Consultando ventas con filtros: ${JSON.stringify(filters)}`);

      const includeOptions = [
        { 
          association: 'inmueble',
          attributes: [
            'id_inmueble',
            'registro_inmobiliario',
            'direccion',
            'ciudad',
            'departamento',
            'categoria',
            'titulo',
            'barrio',
            'pais',
            'precio_venta',
            'area_construida'
          ]
        },
        {
          association: 'vendedor',
          attributes: [
            'id_persona',
            'nombre_completo',
            'apellido_completo',
            'correo',
            'telefono',
            'tipo_documento',
            'numero_documento'
          ]
        },
        {
          association: 'comprador',
          attributes: ['id_comprador', 'registro_comprador'],
          include: [
            {
              association: 'persona',
              attributes: [
                'id_persona',
                'nombre_completo',
                'apellido_completo',
                'correo',
                'telefono',
                'tipo_documento',
                'numero_documento'
              ]
            }
          ]
        }
      ];

      const whereClause = {};
      if (filters.estado) whereClause.estado = filters.estado;
      if (filters.id_persona) whereClause.id_comprador = filters.id_persona;
      if (filters.id_comprador) whereClause.id_comprador = filters.id_comprador;
      if (filters.fecha_inicio && filters.fecha_fin) {
        whereClause.fecha_venta = {
          [Op.between]: [filters.fecha_inicio, filters.fecha_fin]
        };
      }

      const sales = await Sale.findAll({
        where: whereClause,
        include: includeOptions,
        order: [['fecha_venta', 'DESC']],
        logging: false
      });

      logger.info(`✅ ${sales.length} ventas obtenidas exitosamente`);

      return sales.map(sale => ({
        id_venta: sale.id_venta,
tipo_compra: sale.tipo_compra,

        fecha_venta: sale.fecha_venta,
        valor_venta: sale.valor_venta,
        medio_pago: sale.medio_pago,
        estado: sale.estado,
        fecha_creacion: sale.fecha_creacion,
        inmueble: sale.inmueble ? {
          id_inmueble: sale.inmueble.id_inmueble,
          registro_inmobiliario: sale.inmueble.registro_inmobiliario,
          direccion: sale.inmueble.direccion,
          ciudad: sale.inmueble.ciudad,
          departamento: sale.inmueble.departamento,
          categoria: sale.inmueble.categoria,
          titulo: sale.inmueble.titulo,
          barrio: sale.inmueble.barrio,
          pais: sale.inmueble.pais,
          precio_venta: sale.inmueble.precio_venta,
          area_construida: sale.inmueble.area_construida
        } : null,
        vendedor: sale.vendedor ? {
          id_persona: sale.vendedor.id_persona,
          tipo_documento: sale.vendedor.tipo_documento,
          numero_documento: sale.vendedor.numero_documento,
          nombre_completo: sale.vendedor.nombre_completo,
          apellido_completo: sale.vendedor.apellido_completo,
          correo: sale.vendedor.correo,
          telefono: sale.vendedor.telefono
        } : null,
        // Duplicados raíz para el front
        tipo_doc_vendedor: sale.tipo_doc_vendedor || sale.vendedor?.tipo_documento,
        numero_doc_vendedor: sale.numero_doc_vendedor || sale.vendedor?.numero_documento,
        nombre_vendedor: sale.nombre_vendedor || sale.vendedor?.nombre_completo,
        correo_vendedor: sale.correo_vendedor || sale.vendedor?.correo,
        telefono_vendedor: sale.telefono_vendedor || sale.vendedor?.telefono,
        comprador: sale.comprador ? {
          id_comprador: sale.comprador.id_comprador,
          registro_comprador: sale.comprador.registro_comprador,
          id_persona: sale.comprador.persona?.id_persona,
          tipo_documento: sale.comprador.persona?.tipo_documento,
          numero_documento: sale.comprador.persona?.numero_documento,
          nombre_completo: sale.comprador.persona?.nombre_completo,
          apellido_completo: sale.comprador.persona?.apellido_completo,
          correo: sale.comprador.persona?.correo,
          telefono: sale.comprador.persona?.telefono
        } : null,
        // Duplicados a nivel raíz para que el front los consuma directo
        tipo_documento: sale.comprador?.persona?.tipo_documento,
        numero_documento: sale.comprador?.persona?.numero_documento,
        nombre_comprador: sale.comprador?.persona?.nombre_completo,
        email_comprador: sale.comprador?.persona?.correo,
        telefono_comprador: sale.comprador?.persona?.telefono
      }));

    } catch (error) {
      const dbMsg = error.original?.message || error.message || 'Error consultando ventas';
      logger.error(`❌ Error en getAllSales: ${dbMsg}`);
      const err = new Error(dbMsg);
      err.status = 500;
      throw err;
    }
  }

  async updateSale(id, updateData) {
    try {
      const sale = await this.getSaleById(id);

      if (!sale) {
        throw new Error('Venta no encontrada');
      }

      await sale.update(updateData);

      return await this.getSaleById(id);
    } catch (error) {
      throw error;
    }
  }

  async cancelSale(id) {
    try {
      const sale = await this.getSaleById(id);

      if (!sale) {
        throw new Error('Venta no encontrada');
      }

      await sale.update({
        estado: 'Cancelada'
      });

      // Liberar el inmueble (cambiar estado a Disponible)
      await sale.inmueble.update({
        estado: 'Disponible'
      });

      return await this.getSaleById(id);
    } catch (error) {
      throw error;
    }
  }

  async finalizeSale(id) {
    try {
      const sale = await this.getSaleById(id);

      if (!sale) {
        throw new Error('Venta no encontrada');
      }

      await sale.update({
        estado: 'Finalizada'
      });

      return await this.getSaleById(id);
    } catch (error) {
      throw error;
    }
  }

  async addTracking(idVenta, trackingData) {
    try {
      const sale = await this.getSaleById(idVenta);

      if (!sale) {
        throw new Error('Venta no encontrada');
      }

      // Resolver persona a partir del comprador (id_comprador -> persona)
      const buyerId = trackingData.id_comprador || sale.id_comprador;
      const buyer = buyerId
        ? await Buyer.findByPk(buyerId, { include: ['persona'] })
        : null;

      if (!buyer) {
        throw new Error('Comprador no encontrado para el seguimiento');
      }

      const personaId =
        buyer?.persona?.id_persona ||
        buyer?.id_persona ||
        sale?.comprador?.persona?.id_persona ||
        null;

      if (!personaId) {
        throw new Error('No se pudo resolver la persona del comprador para el seguimiento');
      }

      const newTracking = await SeguimientoVenta.create({
        id_venta: idVenta,
        id_estado_venta: trackingData.id_estado_venta,
        id_persona: personaId,
        fecha_estado_seguimiento: trackingData.fecha_estado_seguimiento,
        descripcion: trackingData.descripcion
      });

      return newTracking;
    } catch (error) {
      throw error;
    }
  }

  async getTracking(idVenta) {
    try {
      const tracking = await SeguimientoVenta.findAll({
        where: { id_venta: idVenta },
        include: [
          {
            model: EstadosVenta,
            as: 'estado',
            attributes: ['nombre_estado', 'descripcion']
          },
          {
            model: Persona,
            as: 'persona',
            attributes: ['nombre_completo', 'apellido_completo']
          }
        ],
        order: [['fecha_estado_seguimiento', 'DESC']]
      });

      return tracking;
    } catch (error) {
      throw error;
    }
  }

  async getSalesStatistics() {
    try {
      const statistics = await Sale.findAll({
        attributes: [
          'estado',
          [sequelize.fn('COUNT', '*'), 'total'],
          [sequelize.fn('SUM', sequelize.col('valor_venta')), 'total_ventas']
        ],
        group: ['estado'],
        raw: true
      });

      const totalVentas = await Sale.sum('valor_venta', {
        where: { estado: 'Finalizada' }
      });

      const ventasEsteMes = await Sale.sum('valor_venta', {
        where: {
          estado: 'Finalizada',
          fecha_venta: {
            [Op.between]: [
              new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
            ]
          }
        }
      });

      return {
        por_estado: statistics,
        total_ventas: totalVentas || 0,
        ventas_este_mes: ventasEsteMes || 0
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new SaleService();
