import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/cita_model.dart';
import '../models/user_model.dart';
import 'notification_service.dart';
import 'appointment_integration_service.dart';

class CitasService {
  // Configuración de la API - Para Flutter Web usar 127.0.0.1
  static const String baseUrl = 'http://127.0.0.1:5000/api/v1'; // Cambiar según tu configuración
  static const String citasEndpoint = '/citas';

  // Singleton pattern
  static final CitasService _instance = CitasService._internal();
  factory CitasService() => _instance;
  CitasService._internal();

  // Headers para las peticiones
  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Obtener token de autenticación
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  // Headers con autenticación
  Future<Map<String, String>> get _authHeaders async {
    final token = await _getToken();
    return {
      ..._headers,
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Obtener usuario actual
  Future<User?> getCurrentUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString('current_user');
      if (userJson != null) {
        return User.fromJson(json.decode(userJson));
      }
    } catch (e) {
      print('Error al obtener usuario actual: $e');
    }
    return null;
  }

  // Obtener todas las citas del usuario actual (con cache offline)
  Future<List<Cita>> obtenerCitas() async {
    try {
      final user = await getCurrentUser();
      if (user == null) return [];

      final response = await http.get(
        Uri.parse('$baseUrl$citasEndpoint'),
        headers: await _authHeaders,
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        if (responseData is Map && responseData.containsKey('data')) {
          final List<dynamic> citasJson = responseData['data'];
          final citas = citasJson.map((json) => Cita.fromJson(json)).toList();

          // Guardar en cache local
          await _saveCitasToCache(citas);
          return citas;
        } else {
          print('Formato de respuesta inesperado: $responseData');
          return await _loadCitasFromCache();
        }
      } else {
        print('Error al obtener citas del servidor: ${response.statusCode} - ${response.body}');
        // Intentar cargar desde cache
        return await _loadCitasFromCache();
      }
    } catch (e) {
      print('Error al obtener citas del servidor: $e');
      // Intentar cargar desde cache cuando no hay conexión
      return await _loadCitasFromCache();
    }
  }

  // Crear una nueva cita
  Future<Cita?> crearCita({
    required DateTime fechaHora,
    required String servicio,
    required String detalles,
  }) async {
    print('🏗️ Iniciando creación de cita en servicio...');
    print('📅 Fecha/Hora: $fechaHora');
    print('🛠️ Servicio: $servicio');
    print('📝 Detalles: $detalles');

    try {
      final user = await getCurrentUser();
      print('👤 Usuario obtenido: ${user?.email ?? "null"}');

      if (user == null) {
        print('❌ Usuario no encontrado');
        return null;
      }

      // Mapear servicio a ID según la documentación de la API
      final servicioMapping = {
        'Visita a Propiedad': 1,
        'Avalúos': 2,
        'Gestión de Alquileres': 3,
        'Asesoría Legal': 4,
      };

      final idServicio = servicioMapping[servicio] ?? 1; // Default a Visita a Propiedad

      // Separar nombres y apellidos (lógica mejorada)
      final partesNombre = user.nombreCompleto.trim().split(' ');
      String nombreCompleto;
      String apellidoCompleto;

      if (partesNombre.length >= 2) {
        // Si hay al menos 2 partes, asumir primera como nombre y resto como apellido
        nombreCompleto = partesNombre[0];
        apellidoCompleto = partesNombre.sublist(1).join(' ');
      } else {
        // Si solo hay un nombre, usar apellido por defecto
        nombreCompleto = partesNombre.isNotEmpty ? partesNombre[0] : 'Usuario';
        apellidoCompleto = 'Sin Apellido'; // Apellido por defecto
      }

      final citaData = {
        'tipo_documento': 'CC', // Default
        'numero_documento': user.id.toString().padLeft(10, '0'), // Usar ID como documento temporal
        'nombre_completo': nombreCompleto,
        'apellido_completo': apellidoCompleto,
        'email': user.email, // ✅ Corrección: usar 'email' en lugar de 'correo'
        'telefono': '+573000000000', // Teléfono por defecto (formato válido)
        'id_inmueble': 1, // ID de inmueble por defecto (debería ser configurable)
        'id_servicio': idServicio,
        'fecha_cita': fechaHora.toIso8601String().split('T')[0], // YYYY-MM-DD
        'hora_inicio': '${fechaHora.hour.toString().padLeft(2, '0')}:${fechaHora.minute.toString().padLeft(2, '0')}', // ✅ Corrección: HH:MM (sin segundos)
        'hora_fin': '${(fechaHora.hour + 1).toString().padLeft(2, '0')}:${fechaHora.minute.toString().padLeft(2, '0')}', // ✅ Corrección: +1 hora por defecto, formato HH:MM
        'observaciones': detalles,
        'id_estado_cita': 1, // Solicitada
      };

      print('📦 Datos a enviar: $citaData');

      final headers = await _authHeaders;
      print('🔑 Headers preparados: ${headers.keys}');

      final url = '$baseUrl$citasEndpoint';
      print('🌐 URL: $url');

      final response = await http.post(
        Uri.parse(url),
        headers: headers,
        body: json.encode(citaData),
      );

      print('📡 Respuesta HTTP: ${response.statusCode}');
      print('📄 Body respuesta: ${response.body}');

      if (response.statusCode == 201) {
        print('✅ Cita creada exitosamente');
        final responseData = json.decode(response.body);

        // La API devuelve {success: true, message: "...", data: {...}}
        if (responseData is Map && responseData.containsKey('data')) {
          final citaJson = responseData['data'];
          final nuevaCita = Cita.fromJson(citaJson);

          // Programar notificaciones para la nueva cita
          try {
            await NotificationService().scheduleAppointmentReminder(nuevaCita);
            await NotificationService().scheduleAppointmentConfirmation(nuevaCita);
            print('🔔 Notificaciones programadas');
          } catch (e) {
            print('⚠️ Error al programar notificaciones: $e');
          }

          return nuevaCita;
        } else {
          print('❌ Formato de respuesta inesperado: $responseData');
          return null;
        }
      } else {
        print('❌ Error HTTP al crear cita: ${response.statusCode} - ${response.body}');
        return null;
      }
    } catch (e) {
      print('💥 Excepción al crear cita: $e');
      print('🔍 Stack trace: ${StackTrace.current}');
      return null;
    }
  }

  // Actualizar estado de una cita
  Future<bool> actualizarEstadoCita(String citaId, EstadoCita nuevoEstado) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl$citasEndpoint/$citaId/estado'),
        headers: await _authHeaders,
        body: json.encode({
          'id_estado_cita': nuevoEstado.index + 1, // API usa índices empezando en 1
        }),
      );

      if (response.statusCode == 200) {
        // ✅ INTEGRACIÓN: Si la cita se confirma, procesar integraciones automáticamente
        if (nuevoEstado == EstadoCita.confirmada) {
          try {
            // Obtener la cita actualizada para procesar integraciones
            final citaActualizada = await obtenerCitaPorId(citaId);
            if (citaActualizada != null) {
              print('🚀 Procesando integraciones para cita confirmada: ${citaActualizada.id}');

              // Procesar integraciones en segundo plano
              AppointmentIntegrationService().processConfirmedAppointment(citaActualizada).then((result) {
                print('✅ Integraciones procesadas: ${result['success'] ? 'Éxito' : 'Parcial'}');
                if (result['calendar']?['success'] == true) {
                  print('📅 Cita agregada al calendario exitosamente');
                }
                if (result['notifications']?['success'] == true) {
                  print('🔔 Notificaciones programadas exitosamente');
                }
              }).catchError((error) {
                print('❌ Error al procesar integraciones: $error');
              });
            }
          } catch (e) {
            print('⚠️ Error al procesar integraciones (no crítico): $e');
            // No fallar la actualización del estado por errores en integraciones
          }
        }

        return true;
      } else {
        print('Error al actualizar estado: ${response.statusCode} - ${response.body}');
        return false;
      }
    } catch (e) {
      print('Error al actualizar estado: $e');
      return false;
    }
  }

  // Método auxiliar para actualizar cita (por compatibilidad)
  Future<bool> actualizarCita(Cita cita) async {
    return await actualizarEstadoCita(cita.id, cita.estado);
  }

  // Eliminar una cita
  Future<bool> eliminarCita(String citaId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl$citasEndpoint/$citaId'),
        headers: await _authHeaders,
      );

      if (response.statusCode == 200 || response.statusCode == 204) {
        return true;
      } else {
        print('Error al eliminar cita: ${response.statusCode} - ${response.body}');
        return false;
      }
    } catch (e) {
      print('Error al eliminar cita: $e');
      return false;
    }
  }

  // Obtener cita por ID
  Future<Cita?> obtenerCitaPorId(String id) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl$citasEndpoint/$id'),
        headers: await _authHeaders,
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        if (responseData is Map && responseData.containsKey('data')) {
          final citaJson = responseData['data'];
          return Cita.fromJson(citaJson);
        } else {
          print('Formato de respuesta inesperado: $responseData');
          return null;
        }
      } else {
        print('Error al obtener cita: ${response.statusCode} - ${response.body}');
        return null;
      }
    } catch (e) {
      print('Error al obtener cita: $e');
      return null;
    }
  }

  // Obtener citas por fecha
  Future<List<Cita>> obtenerCitasPorFecha(DateTime fecha) async {
    final citas = await obtenerCitas();
    return citas.where((c) {
      return c.fechaHora.year == fecha.year &&
             c.fechaHora.month == fecha.month &&
             c.fechaHora.day == fecha.day;
    }).toList();
  }

  // Obtener citas CONFIRMADAS por fecha (para bloquear horarios)
  Future<List<Cita>> obtenerCitasConfirmadasPorFecha(DateTime fecha) async {
    try {
      // Obtener todas las citas y filtrar las confirmadas por fecha
      final todasLasCitas = await obtenerCitas();
      final fechaString = fecha.toIso8601String().split('T')[0]; // YYYY-MM-DD

      return todasLasCitas.where((cita) {
        if (cita.estado != EstadoCita.confirmada) return false;

        final citaFechaString = cita.fechaHora.toIso8601String().split('T')[0];
        return citaFechaString == fechaString;
      }).toList();
    } catch (e) {
      print('Error al filtrar citas confirmadas: $e');
      return [];
    }
  }

  // Obtener horarios disponibles para una fecha específica
  Future<List<TimeOfDay>> obtenerHorariosDisponibles(DateTime fecha) async {
    try {
      // Obtener todas las citas confirmadas para esa fecha
      final citasConfirmadas = await obtenerCitasConfirmadasPorFecha(fecha);

      // Crear lista de horarios disponibles (8:00 a 18:00 cada 30 minutos)
      final List<TimeOfDay> todosHorarios = [];
      for (int hora = 8; hora <= 17; hora++) {
        todosHorarios.add(TimeOfDay(hour: hora, minute: 0));
        todosHorarios.add(TimeOfDay(hour: hora, minute: 30));
      }

      // Filtrar horarios que no están ocupados por citas confirmadas
      final horariosOcupados = citasConfirmadas.map((cita) =>
        TimeOfDay(hour: cita.fechaHora.hour, minute: cita.fechaHora.minute)
      ).toSet();

      return todosHorarios.where((horario) => !horariosOcupados.contains(horario)).toList();
    } catch (e) {
      print('Error al obtener horarios disponibles: $e');
      // En caso de error, devolver todos los horarios disponibles
      final List<TimeOfDay> todosHorarios = [];
      for (int hora = 8; hora <= 17; hora++) {
        todosHorarios.add(TimeOfDay(hour: hora, minute: 0));
        todosHorarios.add(TimeOfDay(hour: hora, minute: 30));
      }
      return todosHorarios;
    }
  }

  // Obtener citas por estado
  Future<List<Cita>> obtenerCitasPorEstado(EstadoCita estado) async {
    final citas = await obtenerCitas();
    return citas.where((c) => c.estado == estado).toList();
  }

  // Obtener estadísticas
  Future<Map<EstadoCita, int>> obtenerEstadisticas() async {
    final citas = await obtenerCitas();
    return {
      EstadoCita.solicitada: citas.where((c) => c.estado == EstadoCita.solicitada).length,
      EstadoCita.confirmada: citas.where((c) => c.estado == EstadoCita.confirmada).length,
      EstadoCita.cancelada: citas.where((c) => c.estado == EstadoCita.cancelada).length,
      EstadoCita.completada: citas.where((c) => c.estado == EstadoCita.completada).length,
      EstadoCita.reprogramada: citas.where((c) => c.estado == EstadoCita.reprogramada).length,
    };
  }

  // Buscar citas
  Future<List<Cita>> buscarCitas(String query) async {
    if (query.isEmpty) {
      return await obtenerCitas();
    }

    final citas = await obtenerCitas();
    final queryLower = query.toLowerCase();

    return citas.where((c) {
      return c.nombreCompleto.toLowerCase().contains(queryLower) ||
             c.telefono.contains(queryLower) ||
             c.correo.toLowerCase().contains(queryLower) ||
             c.numeroDocumento.contains(queryLower) ||
             c.servicio.toLowerCase().contains(queryLower);
    }).toList();
  }

  // Métodos para cache offline
  Future<void> _saveCitasToCache(List<Cita> citas) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final citasJson = citas.map((cita) => cita.toJson()).toList();
      await prefs.setString('cached_citas', json.encode(citasJson));
      await prefs.setString('cache_timestamp', DateTime.now().toIso8601String());
    } catch (e) {
      print('Error al guardar citas en cache: $e');
    }
  }

  Future<List<Cita>> _loadCitasFromCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cachedData = prefs.getString('cached_citas');
      if (cachedData != null) {
        final List<dynamic> citasJson = json.decode(cachedData);
        return citasJson.map((json) => Cita.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error al cargar citas desde cache: $e');
    }
    return [];
  }

  // Verificar si hay conexión a internet (simple check)
  Future<bool> hasInternetConnection() async {
    try {
      final response = await http.get(Uri.parse('https://www.google.com'));
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
