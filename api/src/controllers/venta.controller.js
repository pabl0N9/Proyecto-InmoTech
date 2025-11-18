const { Venta, Inmueble, Persona } = require('../models');

const ventaController = {
    
    // Crear nueva venta
    async crearVenta(req, res) {
        try {
            const venta = await Venta.create({
                ...req.body,
                estado: 'cotizacion'
            });

            // Actualizar estado del inmueble a "en venta"
            await Inmueble.update(
                { estado: 'en_venta' }, 
                { where: { id: req.body.inmueble_id } }
            );

            res.status(201).json({
                success: true,
                data: venta,
                message: 'Venta creada exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al crear venta',
                error: error.message
            });
        }
    },

    // Obtener todas las ventas
    async obtenerVentas(req, res) {
        try {
            const { estado } = req.query;
            const where = {};
            
            if (estado) where.estado = estado;

            const ventas = await Venta.findAll({
                where,
                include: [
                    { model: Inmueble },
                    { model: Persona, as: 'Vendedor' },
                    { model: Persona, as: 'Comprador' }
                ],
                order: [['fecha_venta', 'DESC']]
            });

            res.json({
                success: true,
                data: ventas
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener ventas',
                error: error.message
            });
        }
    },

    // Avanzar estado de la venta
    async avanzarEstado(req, res) {
        try {
            const { id } = req.params;
            const venta = await Venta.findByPk(id);

            if (!venta) {
                return res.status(404).json({
                    success: false,
                    message: 'Venta no encontrada'
                });
            }

            const estados = ['cotizacion', 'reservado', 'compromiso', 'escritura', 'completado'];
            const estadoActual = venta.estado;
            const siguienteEstado = estados[estados.indexOf(estadoActual) + 1];

            if (!siguienteEstado) {
                return res.status(400).json({
                    success: false,
                    message: 'La venta ya está en el estado final'
                });
            }

            await venta.update({ estado: siguienteEstado });

            // Si se completa la venta, actualizar estado del inmueble
            if (siguienteEstado === 'completado') {
                await Inmueble.update(
                    { estado: 'vendido' }, 
                    { where: { id: venta.inmueble_id } }
                );
            }

            res.json({
                success: true,
                data: venta,
                message: `Estado avanzado a ${siguienteEstado}`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al avanzar estado',
                error: error.message
            });
        }
    },

    // Obtener estadísticas de ventas
    async obtenerEstadisticas(req, res) {
        try {
            const totalVentas = await Venta.count();
            const ventasCompletadas = await Venta.count({ 
                where: { estado: 'completado' } 
            });
            const ventasEnProceso = await Venta.count({
                where: { 
                    estado: ['cotizacion', 'reservado', 'compromiso', 'escritura'] 
                }
            });

            // Total en comisiones
            const resultado = await Venta.sum('comision', {
                where: { estado: 'completado' }
            });

            res.json({
                success: true,
                data: {
                    totalVentas,
                    ventasCompletadas,
                    ventasEnProceso,
                    totalComisiones: resultado || 0
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }
};

module.exports = ventaController;