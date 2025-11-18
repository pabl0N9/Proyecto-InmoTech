const { Arriendo, Inmueble, Persona } = require('../models');

const arriendoController = {
    
    // Crear nuevo arriendo
    async crearArriendo(req, res) {
        try {
            const arriendo = await Arriendo.create({
                ...req.body,
                estado: 'disponible'
            });

            // Actualizar estado del inmueble a "en_arriendo"
            await Inmueble.update(
                { estado: 'en_arriendo' }, 
                { where: { id: req.body.inmueble_id } }
            );

            res.status(201).json({
                success: true,
                data: arriendo,
                message: 'Arriendo creado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al crear arriendo',
                error: error.message
            });
        }
    },

    // Obtener todos los arriendos
    async obtenerArriendos(req, res) {
        try {
            const { estado } = req.query;
            const where = {};
            
            if (estado) where.estado = estado;

            const arriendos = await Arriendo.findAll({
                where,
                include: [
                    { model: Inmueble },
                    { model: Persona, as: 'Arrendador' },
                    { model: Persona, as: 'Arrendatario' }
                ],
                order: [['fecha_inicio', 'DESC']]
            });

            res.json({
                success: true,
                data: arriendos
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener arriendos',
                error: error.message
            });
        }
    },

    // Reservar arriendo
    async reservarArriendo(req, res) {
        try {
            const { id } = req.params;
            const { arrendatario_id } = req.body;

            const arriendo = await Arriendo.findByPk(id);

            if (!arriendo) {
                return res.status(404).json({
                    success: false,
                    message: 'Arriendo no encontrado'
                });
            }

            if (arriendo.estado !== 'disponible') {
                return res.status(400).json({
                    success: false,
                    message: 'El arriendo no está disponible para reserva'
                });
            }

            await arriendo.update({
                arrendatario_id,
                estado: 'reservado'
            });

            res.json({
                success: true,
                data: arriendo,
                message: 'Arriendo reservado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al reservar arriendo',
                error: error.message
            });
        }
    },

    // Activar arriendo
    async activarArriendo(req, res) {
        try {
            const { id } = req.params;
            const arriendo = await Arriendo.findByPk(id);

            if (!arriendo) {
                return res.status(404).json({
                    success: false,
                    message: 'Arriendo no encontrado'
                });
            }

            if (arriendo.estado !== 'reservado') {
                return res.status(400).json({
                    success: false,
                    message: 'Solo se pueden activar arriendos reservados'
                });
            }

            await arriendo.update({ estado: 'activo' });

            // Actualizar estado del inmueble
            await Inmueble.update(
                { estado: 'arrendado' }, 
                { where: { id: arriendo.inmueble_id } }
            );

            res.json({
                success: true,
                data: arriendo,
                message: 'Arriendo activado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al activar arriendo',
                error: error.message
            });
        }
    },

    // Finalizar arriendo
    async finalizarArriendo(req, res) {
        try {
            const { id } = req.params;
            const arriendo = await Arriendo.findByPk(id);

            if (!arriendo) {
                return res.status(404).json({
                    success: false,
                    message: 'Arriendo no encontrado'
                });
            }

            await arriendo.update({ estado: 'finalizado' });

            // Liberar el inmueble
            await Inmueble.update(
                { estado: 'disponible' }, 
                { where: { id: arriendo.inmueble_id } }
            );

            res.json({
                success: true,
                data: arriendo,
                message: 'Arriendo finalizado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al finalizar arriendo',
                error: error.message
            });
        }
    },

    // Obtener estadísticas de arriendos
    async obtenerEstadisticas(req, res) {
        try {
            const totalArriendos = await Arriendo.count();
            const arriendosActivos = await Arriendo.count({ 
                where: { estado: 'activo' } 
            });
            const arriendosDisponibles = await Arriendo.count({
                where: { estado: 'disponible' }
            });

            // Ingresos mensuales estimados
            const ingresosMensuales = await Arriendo.sum('valor_arriendo', {
                where: { estado: 'activo' }
            });

            res.json({
                success: true,
                data: {
                    totalArriendos,
                    arriendosActivos,
                    arriendosDisponibles,
                    ingresosMensuales: ingresosMensuales || 0
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

module.exports = arriendoController;