const { Lease } = require('../models');
const { Payment } = require('../models');
const { Receipt } = require('../models');
const { Inmueble } = require('../models');
const { Persona } = require('../models');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

class LeaseService {
  async createLease(leaseData) {
    const result = await sequelize.transaction(async (t) => {
      try {
        // 1. Validar que el inmueble existe y está disponible
        const inmueble = await Inmueble.findByPk(leaseData.id_inmueble, { transaction: t });
        if (!inmueble) {
          throw new Error('Inmueble no encontrado');
        }

        if (inmueble.estado !== 'Disponible') {
          throw new Error('El inmueble no está disponible para arrendamiento');
        }

        // 2. Validar que el arrendatario existe
        const arrendatario = await Persona.findByPk(leaseData.id_cliente, { transaction: t });
        if (!arrendatario) {
          throw new Error('Arrendatario no encontrado');
        }

        // 3. Crear el arrendamiento
        const newLease = await Lease.create({
          id_cliente: leaseData.id_cliente,
          id_inmueble: leaseData.id_inmueble,
          fecha_inicio: leaseData.fecha_inicio,
          fecha_finalizacion: leaseData.fecha_finalizacion,
          valor_mensual: leaseData.valor_mensual,
          estado: 'Activo'
        }, { transaction: t });

        // 4. Actualizar estado del inmueble a "Arrendado"
        await inmueble.update({
          estado: 'Arrendado'
        }, { transaction: t });

        // 5. Generar cobros mensuales automáticamente
        await this.generateMonthlyPayments(newLease.id_arrendamiento, t);

        return await this.getLeaseById(newLease.id_arrendamiento, t);

      } catch (error) {
        throw error;
      }
    });

    return result;
  }

  async generateMonthlyPayments(leaseId, transaction = null) {
    try {
      const lease = await this.getLeaseById(leaseId, transaction);
      
      const startDate = new Date(lease.fecha_inicio);
      const endDate = new Date(lease.fecha_finalizacion);
      
      const payments = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const paymentDate = new Date(currentDate);
        const dueDate = new Date(currentDate);
        dueDate.setDate(dueDate.getDate() + 10); // 10 días para pagar
        
        payments.push({
          id_arrendamiento: leaseId,
          fecha_cobro: paymentDate,
          fecha_limite: dueDate,
          valor_pago: lease.valor_mensual,
          estado: 'Pendiente'
        });
        
        // Siguiente mes
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      
      await Payment.bulkCreate(payments, { transaction });
      logger.info(`✅ ${payments.length} cobros generados para arrendamiento ${leaseId}`);
      
    } catch (error) {
      logger.error(`❌ Error generando cobros: ${error.message}`);
      throw error;
    }
  }

  async getLeaseById(id, transaction = null) {
    const lease = await Lease.findByPk(id, {
      include: [
        { 
          association: 'inmueble',
          attributes: ['id_inmueble', 'registro_inmobiliario', 'direccion', 'ciudad', 'departamento', 'categoria']
        },
        { 
          association: 'arrendatario',
          attributes: ['id_persona', 'nombre_completo', 'apellido_completo', 'correo', 'telefono']
        }
      ],
      transaction
    });

    if (!lease) throw new Error('Arrendamiento no encontrado');

    return lease;
  }

  async getAllLeases(filters = {}) {
    try {
      logger.info(`🔍 Consultando arrendamientos con filtros: ${JSON.stringify(filters)}`);

      const includeOptions = [
        {
          association: 'inmueble',
          attributes: ['id_inmueble', 'registro_inmobiliario', 'direccion', 'ciudad', 'departamento', 'categoria']
        },
        {
          association: 'arrendatario',
          attributes: ['id_persona', 'nombre_completo', 'apellido_completo', 'correo', 'telefono']
        }
      ];

      const whereClause = {};
      if (filters.estado) whereClause.estado = filters.estado;
      if (filters.id_cliente) whereClause.id_cliente = filters.id_cliente;
      if (filters.fecha_inicio && filters.fecha_fin) {
        whereClause.fecha_inicio = {
          [Op.between]: [filters.fecha_inicio, filters.fecha_fin]
        };
      }

      const leases = await Lease.findAll({
        where: whereClause,
        include: includeOptions,
        order: [['fecha_inicio', 'DESC']],
        logging: false
      });

      logger.info(`✅ ${leases.length} arrendamientos obtenidos exitosamente`);

      return leases.map(lease => ({
        id_arrendamiento: lease.id_arrendamiento,
        fecha_inicio: lease.fecha_inicio,
        fecha_finalizacion: lease.fecha_finalizacion,
        valor_mensual: lease.valor_mensual,
        estado: lease.estado,
        duracion_meses: lease.duracion_meses,
        fecha_creacion: lease.fecha_creacion,
        inmueble: lease.inmueble ? {
          id_inmueble: lease.inmueble.id_inmueble,
          registro_inmobiliario: lease.inmueble.registro_inmobiliario,
          direccion: lease.inmueble.direccion,
          ciudad: lease.inmueble.ciudad,
          departamento: lease.inmueble.departamento,
          categoria: lease.inmueble.categoria
        } : null,
        arrendatario: lease.arrendatario ? {
          id_persona: lease.arrendatario.id_persona,
          nombre_completo: lease.arrendatario.nombre_completo,
          apellido_completo: lease.arrendatario.apellido_completo,
          correo: lease.arrendatario.correo,
          telefono: lease.arrendatario.telefono
        } : null
      }));

    } catch (error) {
      logger.error(`❌ Error en getAllLeases: ${error.message}`);
      throw error;
    }
  }

  async updateLease(id, updateData) {
    try {
      const lease = await this.getLeaseById(id);

      if (!lease) {
        throw new Error('Arrendamiento no encontrado');
      }

      await lease.update(updateData);

      return await this.getLeaseById(id);
    } catch (error) {
      throw error;
    }
  }

  async cancelLease(id) {
    try {
      const lease = await this.getLeaseById(id);

      if (!lease) {
        throw new Error('Arrendamiento no encontrado');
      }

      await lease.update({
        estado: 'Cancelado'
      });

      // Liberar el inmueble
      await lease.inmueble.update({
        estado: 'Disponible'
      });

      // Cancelar cobros pendientes
      await Payment.update(
        { estado: 'Cancelado' },
        { 
          where: { 
            id_arrendamiento: id,
            estado: 'Pendiente'
          }
        }
      );

      return await this.getLeaseById(id);
    } catch (error) {
      throw error;
    }
  }

  async finalizeLease(id) {
    try {
      const lease = await this.getLeaseById(id);

      if (!lease) {
        throw new Error('Arrendamiento no encontrado');
      }

      await lease.update({
        estado: 'Finalizado'
      });

      // Liberar el inmueble
      await lease.inmueble.update({
        estado: 'Disponible'
      });

      return await this.getLeaseById(id);
    } catch (error) {
      throw error;
    }
  }

  async getPayments(leaseId) {
    try {
      const payments = await Payment.findAll({
        where: { id_arrendamiento: leaseId },
        order: [['fecha_cobro', 'ASC']],
        logging: false
      });

      return payments;
    } catch (error) {
      throw error;
    }
  }

  async updatePaymentStatus(paymentId, status, fechaPago = null) {
    try {
      const payment = await Payment.findByPk(paymentId);

      if (!payment) {
        throw new Error('Cobro no encontrado');
      }

      const updateData = { estado: status };
      if (fechaPago) updateData.fecha_pago = fechaPago;

      await payment.update(updateData);

      // Si se marca como pagado, actualizar estado del arrendamiento a "Al día"
      if (status === 'Pagado') {
        const lease = await this.getLeaseById(payment.id_arrendamiento);
        if (lease.estado === 'Pendiente') {
          await lease.update({ estado: 'Al día' });
        }
      }

      return payment;
    } catch (error) {
      throw error;
    }
  }

  async createReceipt(receiptData) {
    try {
      const newReceipt = await Receipt.create({
        id_cobro: receiptData.id_cobro,
        url_comprobante: receiptData.url_comprobante,
        entidad_bancaria: receiptData.entidad_bancaria,
        referencia_bancaria: receiptData.referencia_bancaria,
        monto_pagado: receiptData.monto_pagado,
        fecha_pago: receiptData.fecha_pago,
        estado: 'En revisión'
      });

      return newReceipt;
    } catch (error) {
      throw error;
    }
  }

  async getLeaseStatistics() {
    try {
      const statistics = await Lease.findAll({
        attributes: [
          'estado',
          [sequelize.fn('COUNT', '*'), 'total'],
          [sequelize.fn('SUM', sequelize.col('valor_mensual')), 'total_mensual']
        ],
        group: ['estado'],
        raw: true
      });

      const totalActivos = await Lease.count({
        where: { estado: 'Activo' }
      });

      const ingresosEsteMes = await Payment.sum('valor_pago', {
        where: {
          estado: 'Pagado',
          fecha_pago: {
            [Op.between]: [
              new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
            ]
          }
        }
      });

      const cobrosPendientes = await Payment.count({
        where: { estado: 'Pendiente' }
      });

      return {
        por_estado: statistics,
        total_activos: totalActivos,
        ingresos_este_mes: ingresosEsteMes || 0,
        cobros_pendientes: cobrosPendientes
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new LeaseService();
