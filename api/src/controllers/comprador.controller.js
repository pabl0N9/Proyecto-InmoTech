// controllers/compradorController.js - VERSIÓN CORREGIDA
const { Persona, Buyer, Inmueble, Sale, Cita } = require('../models');
const { Op } = require('sequelize');

const compradorController = {
    
    async obtenerCompradores(req, res) {
        try {
            console.log('🔍 INICIANDO CONSULTA DE COMPRADORES...');
            
            const { search } = req.query;
            
            // Consulta SIMPLIFICADA para diagnosticar
            const compradores = await Buyer.findAll({
                include: [
                    {
                        model: Persona,
                        as: 'persona',
                        attributes: ['id_persona', 'tipo_documento', 'numero_documento', 'nombre_completo', 'apellido_completo', 'correo', 'telefono'],
                        required: true // INNER JOIN
                    }
                ],
                // ELIMINAR cualquier WHERE temporalmente
                order: [['id_comprador', 'DESC']] // Ordenar por ID para ver el más reciente
            });

            console.log(`✅ Compradores encontrados: ${compradores.length}`);
            
            // Log detallado
            compradores.forEach((comprador) => {
                console.log('--- COMPRADOR ENCONTRADO ---');
                console.log('ID Comprador:', comprador.id_comprador);
                console.log('Registro:', comprador.registro_comprador);
                console.log('ID Persona:', comprador.id_persona);
                console.log('Estado:', comprador.estado);
                console.log('Persona:', comprador.persona ? 'SÍ' : 'NO');
                if (comprador.persona) {
                    console.log('Nombre Persona:', comprador.persona.nombre_completo);
                }
            });

            res.json({
                success: true,
                data: compradores,
                total: compradores.length
            });

        } catch (error) {
            console.error('❌ Error en obtenerCompradores:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener compradores',
                error: error.message
            });
        }
    },

    // MÉTODO CREAR COMPRADOR - CORREGIDO
    async crearComprador(req, res) {
        try {
            const {
                id_persona,
                registro_comprador,
                tipo_compra = 'Pendiente',
                ciudad_residencia,
                direccion_anterior,
                observaciones
            } = req.body;

            console.log('📝 Datos recibidos para crear comprador:', req.body);

            // Validaciones básicas
            if (!id_persona) {
                return res.status(400).json({
                    success: false,
                    message: 'id_persona es requerido'
                });
            }

            if (!registro_comprador) {
                return res.status(400).json({
                    success: false,
                    message: 'registro_comprador es requerido'
                });
            }

            // Verificar si la persona existe
            const persona = await Persona.findByPk(id_persona);
            if (!persona) {
                return res.status(404).json({
                    success: false,
                    message: 'La persona no existe en la base de datos'
                });
            }

            console.log('✅ Persona encontrada:', persona.nombre_completo);

            // Verificar si ya es comprador
            const compradorExistente = await Buyer.findOne({ 
                where: { id_persona } 
            });
            
            if (compradorExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Esta persona ya está registrada como comprador'
                });
            }

            // Crear comprador con datos limpios
            const datosComprador = {
                id_persona,
                registro_comprador: registro_comprador.trim(), // Limpiar espacios
                tipo_compra,
                ciudad_residencia: ciudad_residencia || null,
                direccion_anterior: direccion_anterior || null,
                observaciones: observaciones || null,
                id_inmueble: null,
                fecha_compra: null,
                valor_compra: null,
                id_venta: null,
                estado: 'Activo',
                fecha_registro_comprador: new Date() // Asegurar fecha
            };

            console.log('💾 Creando comprador con datos:', datosComprador);

            const nuevoComprador = await Buyer.create(datosComprador);
            console.log('✅ Comprador creado con ID:', nuevoComprador.id_comprador);

            // Cargar relaciones para la respuesta
            const compradorConRelaciones = await Buyer.findByPk(nuevoComprador.id_comprador, {
                include: [
                    {
                        model: Persona,
                        as: 'persona',
                        attributes: ['id_persona', 'tipo_documento', 'numero_documento', 'nombre_completo', 'apellido_completo', 'correo', 'telefono']
                    }
                ]
            });

            res.status(201).json({
                success: true,
                message: 'Comprador creado exitosamente',
                data: compradorConRelaciones
            });

        } catch (error) {
            console.error('❌ Error al crear comprador:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear comprador',
                error: error.message
            });
        }
    },

    // Los otros métodos permanecen igual...
    async asignarCompra(req, res) {
        // ... mantener igual
    },

    async obtenerCompradorPorId(req, res) {
        // ... mantener igual
    },

    async actualizarComprador(req, res) {
        // ... mantener igual
    },

    async eliminarComprador(req, res) {
        // ... mantener igual
    },

    async obtenerCompradoresPotenciales(req, res) {
        // ... mantener igual
    }
};

module.exports = compradorController;