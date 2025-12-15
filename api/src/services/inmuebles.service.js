const {
  Inmueble,
  Persona,
  PropiedadInmueble,
  Comodidad,
  InmuebleComodidad,
  InmuebleImagen
} = require('../models');
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const VALID_ORDER_COLUMNS = [
  'id_inmueble',
  'registro_inmobiliario',
  'ciudad',
  'categoria',
  'precio_venta',
  'precio_arriendo'
];

const buildEstadoCondition = (valor, column = 'Inmuebles.estado') => {
  if (valor === undefined || valor === null) return null;

  if (typeof valor === 'string' && valor.trim().toLowerCase() === 'todos') {
    return null;
  }

  const normalized = typeof valor === 'string'
    ? valor.trim().toLowerCase()
    : valor;

  const isActivo = normalized === true ||
    normalized === 1 ||
    normalized === '1' ||
    normalized === 'true' ||
    normalized === 'disponible' ||
    normalized === 'activo';

  const isInactivo = normalized === false ||
    normalized === 0 ||
    normalized === '0' ||
    normalized === 'false' ||
    normalized === 'no disponible' ||
    normalized === 'inactivo';

  if (!isActivo && !isInactivo) return null;

  const expectedValues = isActivo
    ? ['1', 'true', 'disponible', 'activo']
    : ['0', 'false', 'no disponible', 'inactivo'];

  const columnReference = sequelize.col(column);

  return sequelize.where(
    sequelize.fn(
      'LOWER',
      sequelize.cast(columnReference, 'NVARCHAR(20)')
    ),
    { [Op.in]: expectedValues }
  );
};

const normalizeAmenityPayload = (comodidades = []) =>
  Array.isArray(comodidades)
    ? comodidades
        .map((amenidad) => {
          if (!amenidad || (!amenidad.nombre && !amenidad.id_comodidad)) {
            return null;
          }
          return {
            id_comodidad: amenidad.id_comodidad,
            nombre: (amenidad.nombre || '').trim(),
            cantidad: amenidad.cantidad ?? 1,
            seleccionada: amenidad.seleccionada ?? true,
            custom: amenidad.custom ?? false
          };
        })
        .filter((item) => item && item.nombre.length > 0)
    : [];

const mapComodidadesFromInstance = (comodidades = []) =>
  comodidades.map((comodidad) => ({
    id_comodidad: comodidad.id_comodidad,
    nombre: comodidad.nombre,
    descripcion: comodidad.descripcion,
    cantidad: comodidad.Inmueble_Comodidades?.cantidad ?? 1,
    seleccionada: comodidad.Inmueble_Comodidades?.seleccionada ?? true,
    custom: comodidad.es_personalizada ?? false
  }));

const mapImagenesFromInstance = (imagenes = []) =>
  imagenes
    .sort((a, b) => {
      const orderA = a.orden ?? 9999;
      const orderB = b.orden ?? 9999;
      return orderA - orderB;
    })
    .map((imagen) => ({
      id_imagen: imagen.id_imagen,
      url: imagen.ruta_archivo,
      nombre_archivo: imagen.nombre_archivo,
      titulo: imagen.titulo,
      descripcion: imagen.descripcion,
      es_principal: imagen.es_principal ?? false,
      orden: imagen.orden
    }));

const mapInmuebleResponse = (inmueble) => {
  if (!inmueble) return null;
  const plain = typeof inmueble.get === 'function' ? inmueble.get({ plain: true }) : inmueble;

  if (plain.comodidades) {
    plain.comodidades = mapComodidadesFromInstance(plain.comodidades);
  }

  if (plain.imagenes) {
    plain.imagenes = mapImagenesFromInstance(plain.imagenes);
  }

  if (plain.propietarios) {
    plain.propietarios = plain.propietarios.map((owner) => {
      const persona = owner.propietario || owner; // soporta relación PropiedadInmueble -> Persona
      return {
        id_persona: persona.id_persona,
        nombre_completo: persona.nombre_completo,
        apellido_completo: persona.apellido_completo,
        correo: persona.correo,
        telefono: persona.telefono,
        documento: persona.tipo_documento
          ? `${persona.tipo_documento} ${persona.numero_documento || ''}`.trim()
          : persona.numero_documento
      };
    });
  }

  return plain;
};

const resolveOwnerIdFromPayload = (payload = {}) => (
  payload.propietario_id ||
  payload.propietarioId ||
  payload.propietario?.id ||
  payload.propietario?.id_persona ||
  payload.propietario?.idPersona ||
  null
);

const syncPropietario = async (inmuebleId, propietarioId, transaction) => {
  if (!propietarioId) return;

  await PropiedadInmueble.update(
    {
      estado: 'Inactivo',
      es_propietario_actual: false,
      fecha_final: new Date()
    },
    {
      where: { id_inmueble: inmuebleId, es_propietario_actual: true },
      transaction
    }
  );

  const existing = await PropiedadInmueble.findOne({
    where: { id_inmueble: inmuebleId, id_persona: propietarioId },
    transaction
  });

  if (existing) {
    await existing.update(
      {
        estado: 'Activo',
        es_propietario_actual: true,
        fecha_final: null
      },
      { transaction }
    );
  } else {
    await PropiedadInmueble.create(
      {
        id_inmueble: inmuebleId,
        id_persona: propietarioId,
        fecha_inicio: new Date(),
        estado: 'Activo',
        es_propietario_actual: true,
        porcentaje_propiedad: 100
      },
      { transaction }
    );
  }
};

const syncComodidades = async (inmuebleId, comodidades = [], transaction) => {
  const amenities = normalizeAmenityPayload(comodidades);
  await InmuebleComodidad.destroy({
    where: { id_inmueble: inmuebleId },
    transaction
  });

  for (const amenidad of amenities) {
    const [comodidadRecord] = await Comodidad.findOrCreate({
      where: { nombre: amenidad.nombre },
      defaults: {
        descripcion: amenidad.descripcion || null,
        tipo_inmueble: amenidad.tipo_inmueble || null,
        estado: true,
        es_personalizada: amenidad.custom ?? false
      },
      transaction
    });

    await InmuebleComodidad.create(
      {
        id_inmueble: inmuebleId,
        id_comodidad: comodidadRecord.id_comodidad,
        cantidad: amenidad.cantidad ?? 1,
        seleccionada: amenidad.seleccionada ?? true
      },
      { transaction }
    );
  }
};

const syncImagenes = async (inmuebleId, imagenes = [], transaction) => {
  if (!InmuebleImagen) return;

  await InmuebleImagen.destroy({
    where: { id_inmueble: inmuebleId },
    transaction
  });

  if (!Array.isArray(imagenes)) return;

  for (let index = 0; index < imagenes.length; index++) {
    const src = imagenes[index];
    if (!src) continue;

    let ruta_archivo = '';
    let nombre_archivo = `imagen-${index + 1}`;

    if (typeof src === 'string') {
      const isDataUri = src.startsWith('data:');

      if (isDataUri) {
        try {
          const [, metaAndData] = src.split('base64,');
          const mimeMatch = src.match(/^data:(.*?);base64,/);
          const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const extension = mime.split('/')[1] || 'jpg';
          const buffer = Buffer.from(metaAndData, 'base64');

          const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'inmuebles', String(inmuebleId));
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          nombre_archivo = `${Date.now()}-${index}.${extension}`;
          const filePath = path.join(uploadsDir, nombre_archivo);
          fs.writeFileSync(filePath, buffer);
          ruta_archivo = `/uploads/inmuebles/${inmuebleId}/${nombre_archivo}`;
        } catch (error) {
          logger.error('Error guardando data URI de imagen, se omite:', error.message);
          continue;
        }
      } else {
        nombre_archivo = src.split('/').pop()?.split('?')[0] || `imagen-${index + 1}`;
        ruta_archivo = src.length > 500 ? src.slice(0, 480) : src;
      }
    }

    await InmuebleImagen.create(
      {
        id_inmueble: inmuebleId,
        nombre_archivo,
        ruta_archivo,
        titulo: null,
        descripcion: null,
        es_principal: index === 0,
        orden: index + 1
      },
      { transaction }
    );
  }
};

class InmueblesService {
  async crearInmueble(inmuebleData, userId) {
    const result = await sequelize.transaction(async (t) => {
      const {
        comodidades,
        propietario,
        propietario_id,
        propietarioId,
        imagenes,
        ...payload
      } = inmuebleData;

      const ownerId = resolveOwnerIdFromPayload({
        propietario,
        propietario_id,
        propietarioId
      });

      const inmueble = await Inmueble.create({
        ...payload,
        estado: payload.estado ?? true
      }, { transaction: t });

      await syncPropietario(inmueble.id_inmueble, ownerId, t);
      await syncComodidades(inmueble.id_inmueble, comodidades, t);
      await syncImagenes(inmueble.id_inmueble, imagenes, t);

      const persona = await Persona.findByPk(userId, { transaction: t });
      if (persona && !persona.tiene_cuenta) {
        // El rol de propietario se maneja en otra parte del flujo
      }

      logger.info(`Inmueble creado: ${inmueble.registro_inmobiliario} por usuario ${userId}`);
      return this.obtenerPorId(inmueble.id_inmueble, t);
    });

    return result;
  }

  async listarInmuebles(filtros = {}, opciones = {}) {
    try {
      const {
        ciudad,
        precio_min,
        precio_max,
        area_min,
        categoria,
        estado
      } = filtros;

      const {
        pagina = 1,
        limite = 20,
        ordenarPor = 'id_inmueble',
        orden = 'DESC'
      } = opciones;

      const orderColumn = VALID_ORDER_COLUMNS.includes(ordenarPor)
        ? ordenarPor
        : 'id_inmueble';

      const offset = (pagina - 1) * limite;
      const whereClause = {};

      const estadoCondition = buildEstadoCondition(estado, 'Inmuebles.estado');
      if (estadoCondition) {
        whereClause[Op.and] = whereClause[Op.and] || [];
        whereClause[Op.and].push(estadoCondition);
      }

      if (ciudad) whereClause.ciudad = { [Op.iLike]: `%${ciudad}%` };
      if (categoria) whereClause.categoria = categoria;
      if (precio_min || precio_max) {
        whereClause.precio_venta = {};
        if (precio_min) whereClause.precio_venta[Op.gte] = precio_min;
        if (precio_max) whereClause.precio_venta[Op.lte] = precio_max;
      }
      if (area_min) whereClause.area_construida = { [Op.gte]: area_min };

      const includes = [];

      if (PropiedadInmueble && Persona) {
        includes.push({
          model: PropiedadInmueble,
          as: 'propietarios',
          include: [{
            model: Persona,
            as: 'propietario',
            attributes: [
              'id_persona',
              'nombre_completo',
              'apellido_completo',
              'correo',
              'telefono',
              'tipo_documento',
              'numero_documento'
            ]
          }],
          attributes: []
        });
      }

      if (Comodidad && InmuebleComodidad) {
        includes.push({
          model: Comodidad,
          as: 'comodidades',
          attributes: ['id_comodidad', 'nombre', 'descripcion', 'es_personalizada'],
          through: {
            model: InmuebleComodidad,
            attributes: ['cantidad', 'seleccionada']
          }
        });
      }

      if (InmuebleImagen) {
        includes.push({
          model: InmuebleImagen,
          as: 'imagenes',
          attributes: ['id_imagen', 'ruta_archivo', 'nombre_archivo', 'titulo', 'descripcion', 'es_principal', 'orden']
        });
      }

      const { count, rows } = await Inmueble.findAndCountAll({
        where: whereClause,
        limit: limite,
        offset,
        order: [[orderColumn, orden]],
        include: includes
      });

      return {
        inmuebles: rows.map(mapInmuebleResponse),
        paginacion: {
          total: count,
          pagina,
          limite,
          paginas_totales: Math.ceil(count / limite)
        }
      };
    } catch (error) {
      logger.error('Error listando inmuebles:', error);
      throw error;
    }
  }

  async obtenerPorId(inmuebleId, transaction = null) {
    try {
      const includes = [];

      if (PropiedadInmueble && Persona) {
        includes.push({
          model: PropiedadInmueble,
          as: 'propietarios',
          include: [{
            model: Persona,
            as: 'propietario',
            attributes: [
              'id_persona',
              'nombre_completo',
              'apellido_completo',
              'correo',
              'telefono',
              'tipo_documento',
              'numero_documento'
            ]
          }],
          attributes: []
        });
      }

      if (Comodidad && InmuebleComodidad) {
        includes.push({
          model: Comodidad,
          as: 'comodidades',
          attributes: ['id_comodidad', 'nombre', 'descripcion', 'es_personalizada'],
          through: {
            model: InmuebleComodidad,
            attributes: ['cantidad', 'seleccionada']
          }
        });
      }

      if (InmuebleImagen) {
        includes.push({
          model: InmuebleImagen,
          as: 'imagenes',
          attributes: ['id_imagen', 'ruta_archivo', 'nombre_archivo', 'titulo', 'descripcion', 'es_principal', 'orden']
        });
      }

      const inmueble = await Inmueble.findOne({
        where: { id_inmueble: inmuebleId },
        transaction,
        include: includes
      });

      if (!inmueble) {
        throw new Error('Inmueble no encontrado');
      }

      return mapInmuebleResponse(inmueble);
    } catch (error) {
      logger.error('Error obteniendo inmueble:', error);
      throw error;
    }
  }

  async obtenerPorRegistro(registro, transaction = null) {
    if (!registro) {
      throw new Error('Registro inmobiliario requerido');
    }

    try {
      const includes = [];

      if (PropiedadInmueble && Persona) {
        includes.push({
          model: PropiedadInmueble,
          as: 'propietarios',
          include: [{
            model: Persona,
            as: 'propietario',
            attributes: [
              'id_persona',
              'nombre_completo',
              'apellido_completo',
              'correo',
              'telefono',
              'tipo_documento',
              'numero_documento'
            ]
          }],
          attributes: []
        });
      }

      if (Comodidad && InmuebleComodidad) {
        includes.push({
          model: Comodidad,
          as: 'comodidades',
          attributes: ['id_comodidad', 'nombre', 'descripcion', 'es_personalizada'],
          through: {
            model: InmuebleComodidad,
            attributes: ['cantidad', 'seleccionada']
          }
        });
      }

      if (InmuebleImagen) {
        includes.push({
          model: InmuebleImagen,
          as: 'imagenes',
          attributes: ['id_imagen', 'ruta_archivo', 'nombre_archivo', 'titulo', 'descripcion', 'es_principal', 'orden']
        });
      }

      const inmueble = await Inmueble.findOne({
        where: { registro_inmobiliario: registro },
        transaction,
        include: includes
      });

      if (!inmueble) {
        throw new Error('Inmueble no encontrado');
      }

      return mapInmuebleResponse(inmueble);
    } catch (error) {
      logger.error('Error obteniendo inmueble por registro:', error);
      throw error;
    }
  }

  async obtenerDisponibilidad(inmuebleId, fecha) {
    try {
      const inmueble = await this.obtenerPorId(inmuebleId);
      const { Cita, ServicioCita } = require('../models');

      const citasDelDia = await Cita.findAll({
        where: {
          id_inmueble: inmuebleId,
          fecha_cita: fecha,
          id_estado_cita: { [Op.in]: [1, 2, 3] } // Solicitada, Confirmada, Programada
        },
        include: [
          {
            model: ServicioCita,
            as: 'servicio',
            attributes: ['duracion_estimada']
          }
        ]
      });

      const horaInicio = 8;
      const horaFin = 18;
      const intervalo = 30; // minutos

      const horariosDisponibles = [];
      let horaActual = horaInicio;

      while (horaActual < horaFin) {
        const horaInicioSlot = `${horaActual.toString().padStart(2, '0')}:00:00`;
        const horaFinSlot = `${(horaActual + intervalo / 60).toString().padStart(2, '0')}:00:00`;

        const conflicto = citasDelDia.some(cita => {
          const citaInicio = cita.hora_inicio;
          const citaFin = cita.hora_fin;
          return (horaInicioSlot < citaFin && horaFinSlot > citaInicio);
        });

        if (!conflicto) {
          horariosDisponibles.push({
            hora_inicio: horaInicioSlot,
            hora_fin: horaFinSlot,
            disponible: true
          });
        }

        horaActual += intervalo / 60;
      }

      return {
        inmueble: {
          id_inmueble: inmueble.id_inmueble,
          registro_inmobiliario: inmueble.registro_inmobiliario,
          direccion: inmueble.direccion
        },
        fecha,
        horarios_disponibles: horariosDisponibles
      };
    } catch (error) {
      logger.error('Error obteniendo disponibilidad:', error);
      throw error;
    }
  }

  async actualizarInmueble(inmuebleId, updateData) {
    const result = await sequelize.transaction(async (t) => {
      const {
        comodidades,
        propietario,
        propietario_id,
        propietarioId,
        imagenes,
        ...payload
      } = updateData;

      const ownerId = resolveOwnerIdFromPayload({
        propietario,
        propietario_id,
        propietarioId
      });

      const inmueble = await Inmueble.findOne({
        where: { id_inmueble: inmuebleId },
        transaction: t
      });

      if (!inmueble) {
        throw new Error('Inmueble no encontrado');
      }

      await inmueble.update(payload, { transaction: t });
      await syncPropietario(inmuebleId, ownerId, t);
      await syncComodidades(inmuebleId, comodidades, t);
      await syncImagenes(inmuebleId, imagenes, t);

      logger.info(`Inmueble actualizado: ${inmuebleId}`);
      return this.obtenerPorId(inmuebleId, t);
    });

    return result;
  }

  async eliminarInmueble(inmuebleId) {
    const result = await sequelize.transaction(async (t) => {
      const inmueble = await Inmueble.findOne({
        where: { id_inmueble: inmuebleId },
        transaction: t
      });

      if (!inmueble) {
        throw new Error('Inmueble no encontrado');
      }

      await inmueble.update({ estado: false }, { transaction: t });
      logger.info(`Inmueble eliminado: ${inmuebleId}`);
      return true;
    });

    return result;
  }
}

module.exports = new InmueblesService();
