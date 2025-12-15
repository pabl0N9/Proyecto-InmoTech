import { apiClient } from './api.config';

class InvitacionApiService {
  async validar(token) {
    // Pasamos el token directamente como query (apiClient.get espera un objeto plano)
    return apiClient.get('/auth/verify-email', { token });
  }

  async aceptar({ token, codigo_6d, password }) {
    return apiClient.post('/invitaciones/aceptar', { token, codigo_6d, password });
  }

  async reenviar(token) {
    return apiClient.post('/invitaciones/reenviar', { token });
  }

  async crearInvitacion(id_persona) {
    return apiClient.post('/invitaciones', { id_persona });
  }

  async verificarCorreo(token) {
    return apiClient.get('/auth/verify-email', { token });
  }
}

export default new InvitacionApiService();
