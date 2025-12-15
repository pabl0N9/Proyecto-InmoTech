import { apiClient } from './api.config';

class InvitacionApiService {
  async validar(token) {
<<<<<<< HEAD
    // Pasamos el token directamente como query (apiClient.get espera un objeto plano)
    return apiClient.get('/auth/verify-email', { token });
=======
    return apiClient.get('/invitaciones/validar', { params: { token } });
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
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
<<<<<<< HEAD
    return apiClient.get('/auth/verify-email', { token });
=======
    return apiClient.get('/auth/verify-email', { params: { token } });
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  }
}

export default new InvitacionApiService();
