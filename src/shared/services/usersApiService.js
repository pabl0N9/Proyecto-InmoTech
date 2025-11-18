import { apiClient } from './api.config';

class UsersApiService {
  constructor() {
    // Usar apiClient en lugar de axios directamente
  }

  /**
   * Normalizar campos de personas para formato consistente
   * @param {Array} personas - Lista de personas desde la API
   * @returns {Array} Lista de personas con campos normalizados
   */
  normalizePersonas(personas) {
    if (!Array.isArray(personas)) return [];

    // Filtrar elementos undefined/null
    personas = personas.filter(p => p && typeof p === 'object');

    return personas.map(persona => {
      // Helper para filtrar valores "undefined" y undefined
      const safeString = (value) => {
        if (value === undefined || value === null) return '';
        if (typeof value === 'string' && (value === 'undefined' || value.trim() === 'undefined')) return '';
        return String(value).trim();
      };

      return {
        id_persona: persona.id_persona,
        estado: persona.estado === true || persona.estado === 1 || persona.estado === 'true',
        // Normalizar nombres - filtrar específicamente "undefined"
        nombre_completo: safeString(persona.nombre_completo) ||
                         safeString(persona.nombres) ||
                         safeString(persona.primer_nombre) || '',
        apellido_completo: safeString(persona.apellido_completo) ||
                           safeString(persona.apellidos) ||
                           safeString(persona.primer_apellido) || '',
        // Normalizar contacto
        correo: safeString(persona.correo) || safeString(persona.email) || '',
        telefono: safeString(persona.telefono) || safeString(persona.phone) || '',
        // Normalizar documento
        tipo_documento: safeString(persona.tipo_documento) || safeString(persona.tipoDocumento) || '',
        numero_documento: safeString(persona.numero_documento) || safeString(persona.numeroDocumento) || '',
        // Normalizar fechas
        fecha_registro: persona.fecha_registro || persona.createdAt || persona.fecha_creacion || null,
        updatedAt: persona.updatedAt || null,
        // Mantener otros campos
        roles: persona.roles || [],
        administrativo: persona.administrativo || null
      };
    });
  }

  /**
   * Obtener lista de usuarios (personas con rol 'Usuario') con paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista de usuarios
   */
  async getUsers(params = {}) {
    try {
      console.log('📤 USERS API: Solicitando lista de usuarios...');

      // No forzar filtro de estado para mostrar todos los usuarios
      const responseParams = { ...params };
      delete responseParams.estado; // Eliminar cualquier filtro de estado forzado

      const response = await apiClient.get('/personas', { params: responseParams });
      console.log('📥 USERS API: Respuesta del servidor:', response);

      // La respuesta del servidor es: { success: true, message: '...', data: {personas, paginacion} }
      if (!response || !response.data) {
        console.error('❌ Respuesta inesperada del servidor:', response);
        throw new Error('Formato de respuesta inesperado del servidor');
      }

      const { personas, paginacion } = response.data;
      console.log('✅ USERS API: Datos extraídos correctamente - personas:', personas?.length || 0, 'paginación:', paginacion);

      // Filtrar solo personas con rol 'Usuario' en frontend (por ahora mostrar todas)
      const allPersonas = personas || [];
      // TODO: Implementar filtrado por rol Usuario cuando sea necesario
      const usuarios = this.normalizePersonas(allPersonas); // ✅ NORMALIZAR TODOS LOS CAMPOS

      console.log('✅ USERS API: Total usuarios normalizados:', usuarios.length);

      return {
        data: {
          personas: usuarios,
          paginacion: {
            ...paginacion,
            total: paginacion?.total || usuarios.length
          }
        }
      };
    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener un usuario por ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  async getUserById(id) {
    try {
      const response = await apiClient.get(`/personas/${id}`);
      const persona = response.data.data;

      // Verificar que tenga rol 'Usuario'
      if (!persona.roles || !persona.roles.some(rol => rol.nombre_rol === 'Usuario')) {
        throw new Error('Persona no es un usuario');
      }

      return response;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo usuario (utiliza el endpoint administrativo /personas para crear cuenta completa)
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async createUser(userData) {
    try {
      // ✅ CAMBIO: Usar el endpoint administrativo /personas en lugar de /auth/register
      // Esto crea la persona, acceso y rol sin cambiar la sesión del administrador
      const personaPayload = {
        tipo_documento: userData.tipo_documento,
        numero_documento: userData.numero_documento,
        nombre_completo: userData.nombre_completo,
        apellido_completo: userData.apellido_completo,
        correo: userData.correo,
        telefono: userData.telefono,
        password: userData.password,
        confirmPassword: userData.confirmPassword
      };

      return await apiClient.post('/personas', personaPayload);
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }

  /**
   * Actualizar un usuario
   * @param {number} id - ID del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updateUser(id, userData) {
    try {
      return await apiClient.patch(`/personas/${id}`, userData);
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  }

  /**
   * Cambiar estado de un usuario (habilitado/deshabilitado)
   * @param {number} id - ID del usuario
   * @param {Object} estadoData - Datos del cambio de estado
   * @returns {Promise<Object>} Resultado de la operación
   */
  async changeUserStatus(id, estadoData) {
    try {
      // Usar endpoint específico para cambiar estado
      const requestData = {
        estado: estadoData.estado  // Solo enviar el campo estado
      };
      return await apiClient.patch(`/personas/${id}/estado`, requestData);
    } catch (error) {
      console.error('Error cambiando estado del usuario:', error);
      throw error;
    }
  }

  /**
   * Eliminar un usuario (desactivación lógica)
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} Resultado de la operación
   */
  async deleteUser(id) {
    try {
      // Usar endpoint específico para cambiar estado
      const updateData = {
        estado: false
      };
      return await apiClient.patch(`/personas/${id}/estado`, updateData);
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }

  /**
   * Verifica si existe un correo electrónico
   * @param {string} email - Correo electrónico a verificar
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verificarCorreoExistente(email) {
    try {
      const response = await apiClient.get(`/personas/verificar-correo/${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.error('Error verificando correo:', error);
      throw error;
    }
  }

  /**
   * Verifica si existe un número de documento
   * @param {string} tipo - Tipo de documento
   * @param {string} numero - Número de documento
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verificarDocumentoExistente(tipo, numero) {
    try {
      const response = await apiClient.get(`/personas/verificar-documento/${encodeURIComponent(tipo)}/${encodeURIComponent(numero)}`);
      return response.data;
    } catch (error) {
      console.error('Error verificando documento:', error);
      throw error;
    }
  }

  /**
   * Formatear fecha para display
   * @param {string} fechaString - Fecha en formato string
   * @returns {string} Fecha formateada
   */
  formatFecha(fechaString) {
    if (!fechaString) return '-';

    try {
      const date = new Date(fechaString);
      if (isNaN(date.getTime())) return fechaString;

      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return fechaString;
    }
  }
}

export default new UsersApiService();
