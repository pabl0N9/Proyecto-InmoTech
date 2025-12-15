const { Op } = require("sequelize");
const { Sale, Buyer, Inmueble, Persona, SeguimientoVenta, EstadosVenta } = require('../models');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

class SaleService {
  async createSale(saleData) {
    const result = await sequelize.transaction(async (t) => {
      try {
        // 1. Validar que el inmueble existe y está disponible
        const inmueble = await Inmueble.findByPk(saleData.id_inmueble, { transaction: t });
        if (!inmueble) {
          throw new Error('Inmueble no encontrado');
        }

        // 2. Validar que el comprador existe (tabla Compradores)
        const compradorId = saleData.id_comprador || saleData.id_persona;
        const comprador = await Buyer.findByPk(compradorId, { transaction: t, include: ['persona'] });
        if (!comprador) {
          throw new Error('Comprador no encontrado');
        }

        // 3. Crear la venta
        const newSale = await Sale.create({
          id_comprador: compradorId,
          id_inmueble: saleData.id_inmueble,
          fecha_venta: saleData.fecha_venta,
          valor_venta: saleData.valor_venta,
          medio_pago: saleData.medio_pago,
          estado: 'Activa'
        }, { transaction: t });

        // 4. Actualizar estado del inmueble a "Vendido"
        await inmueble.update({
          estado: 'Vendido'
        }, { transaction: t });

        return await this.getSaleById(newSale.id_venta, t);

      } catch (error) {
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
          attributes: ['id_inmueble', 'registro_inmobiliario', 'direccion', 'ciudad', 'departamento', 'categoria']
        },
        { 
          association: 'comprador',
          attributes: ['id_persona', 'nombre_completo', 'apellido_completo', 'correo', 'telefono']
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
          attributes: ['id_inmueble', 'registro_inmobiliario', 'direccion', 'ciudad', 'departamento', 'categoria']
        },
        {
          association: 'comprador',
          attributes: ['id_comprador', 'registro_comprador'],
          include: [
            {
              association: 'persona',
              attributes: ['id_persona', 'nombre_completo', 'apellido_completo', 'correo', 'telefono']
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
          categoria: sale.inmueble.categoria
        } : null,
        comprador: sale.comprador ? {
          id_comprador: sale.comprador.id_comprador,
          registro_comprador: sale.comprador.registro_comprador,
          id_persona: sale.comprador.persona?.id_persona,
          nombre_completo: sale.comprador.persona?.nombre_completo,
          apellido_completo: sale.comprador.persona?.apellido_completo,
          correo: sale.comprador.persona?.correo,
          telefono: sale.comprador.persona?.telefono
        } : null
      }));

    } catch (error) {
      const dbMsg = error.original?.message || error.message || 'Error consultando ventas';
      logger.error(`❌ Error en getAllSales: ${dbMsg}`);

      // Evitar romper el dashboard si la tabla no existe en la BD actual
      if (dbMsg.includes('Invalid object name') || dbMsg.includes('does not exist')) {
        logger.warn('Tabla de ventas/compradores no encontrada. Devolviendo lista vac?a.');
        return [];
      }

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

      const newTracking = await SeguimientoVenta.create({
        id_venta: idVenta,
        id_estado_venta: trackingData.id_estado_venta,
        id_persona: trackingData.id_persona,
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
