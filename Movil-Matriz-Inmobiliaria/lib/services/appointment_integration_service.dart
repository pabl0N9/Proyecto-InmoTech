import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../models/cita_model.dart';
import 'calendar_service.dart';
import 'notification_service.dart';

class AppointmentIntegrationService {
  static final AppointmentIntegrationService _instance = AppointmentIntegrationService._internal();
  factory AppointmentIntegrationService() => _instance;
  AppointmentIntegrationService._internal();

  final CalendarService _calendarService = CalendarService();
  final NotificationService _notificationService = NotificationService();

  /// Procesa una cita confirmada: agrega al calendario y programa notificaciones
  Future<Map<String, dynamic>> processConfirmedAppointment(Cita cita) async {
    final results = <String, dynamic>{
      'success': false,
      'calendar': {'success': false, 'message': ''},
      'notifications': {'success': false, 'message': ''},
      'permissions': {'calendar': true, 'notifications': true} // Asumir permisos concedidos
    };

    try {
      print('🚀 Procesando cita confirmada: ${cita.id} - ${cita.nombreCompleto}');

      // 1. Agregar cita al calendario
      print('📅 Agregando cita al calendario...');
      final calendarResults = await _calendarService.addAppointmentToAllCalendars(cita);

      results['calendar'] = {
        'success': calendarResults['appointment'] == true && calendarResults['reminders'] == true,
        'message': _getCalendarResultMessage(calendarResults),
        'details': calendarResults
      };

      // 2. Programar notificaciones avanzadas
      print('🔔 Programando notificaciones...');
      await _notificationService.scheduleAdvancedAppointmentNotifications(cita);

      results['notifications'] = {
        'success': true,
        'message': 'Notificaciones programadas exitosamente'
      };

      // 3. Mostrar notificación de confirmación
      await _notificationService.showImmediateNotificationWithSound(
        title: '✅ Cita Confirmada',
        body: 'Tu cita con ${cita.nombreCompleto} ha sido agendada y recordatorios programados',
        playSound: true,
        priority: Priority.high,
      );

      results['success'] = results['calendar']['success'] || results['notifications']['success'];

      print('✅ Procesamiento completado: ${results['success'] ? 'Éxito' : 'Parcial'}');
      return results;

    } catch (e) {
      print('❌ Error procesando cita confirmada: $e');
      results['calendar']['message'] = 'Error interno del sistema';
      results['notifications']['message'] = 'Error interno del sistema';
      return results;
    }
  }

  /// Solicita permisos necesarios para el funcionamiento completo
  Future<Map<String, bool>> requestPermissions() async {
    final results = <String, bool>{};

    try {
      // Solicitar permisos de notificaciones
      results['notifications'] = await _notificationService.requestNotificationPermissions();
      results['calendar'] = true; // Calendario usa add_2_calendar, no requiere permisos específicos

      print('🔐 Permisos solicitados: Calendario=${results['calendar']}, Notificaciones=${results['notifications']}');
      return results;
    } catch (e) {
      print('❌ Error solicitando permisos: $e');
      return {'calendar': false, 'notifications': false};
    }
  }

  /// Verifica estado de permisos
  Future<Map<String, bool>> checkPermissions() async {
    final results = <String, bool>{};

    try {
      results['notifications'] = await _notificationService.areNotificationsEnabled();
      results['calendar'] = true; // Calendario usa add_2_calendar, no requiere permisos específicos

      return results;
    } catch (e) {
      print('❌ Error verificando permisos: $e');
      return {'calendar': false, 'notifications': false};
    }
  }

  /// Cancela todas las integraciones de una cita (calendario y notificaciones)
  Future<void> cancelAppointmentIntegrations(int appointmentId) async {
    try {
      print('🗑️ Cancelando integraciones para cita: $appointmentId');

      // Cancelar notificaciones
      await _notificationService.cancelAppointmentNotifications(appointmentId);

      // Nota: No podemos eliminar eventos del calendario automáticamente
      // El usuario tendría que hacerlo manualmente en su app de calendario

      print('✅ Integraciones canceladas para cita: $appointmentId');
    } catch (e) {
      print('❌ Error cancelando integraciones: $e');
    }
  }

  /// Actualiza las integraciones cuando una cita cambia
  Future<Map<String, dynamic>> updateAppointmentIntegrations(Cita citaAnterior, Cita citaActualizada) async {
    try {
      print('🔄 Actualizando integraciones para cita: ${citaActualizada.id}');

      // Cancelar integraciones anteriores
      await cancelAppointmentIntegrations(int.parse(citaAnterior.id));

      // Crear nuevas integraciones
      return await processConfirmedAppointment(citaActualizada);
    } catch (e) {
      print('❌ Error actualizando integraciones: $e');
      return {
        'success': false,
        'message': 'Error actualizando integraciones'
      };
    }
  }

  /// Método auxiliar para interpretar resultados del calendario
  String _getCalendarResultMessage(Map<String, bool> results) {
    final appointment = results['appointment'] ?? false;
    final reminders = results['reminders'] ?? false;

    if (appointment && reminders) {
      return 'Cita y recordatorios agregados al calendario exitosamente';
    } else if (appointment) {
      return 'Cita agregada al calendario (recordatorios no disponibles)';
    } else if (reminders) {
      return 'Recordatorios programados (calendario no disponible)';
    } else {
      return 'No se pudo acceder al calendario del dispositivo';
    }
  }

  /// Muestra un resumen de las integraciones activas para una cita
  Future<Map<String, dynamic>> getAppointmentIntegrationStatus(Cita cita) async {
    final status = <String, dynamic>{
      'appointment_id': cita.id,
      'calendar_integrated': false,
      'notifications_scheduled': false,
      'permissions_granted': await checkPermissions(),
    };

    // Aquí podríamos verificar si las notificaciones están realmente programadas
    // Por simplicidad, asumimos que si la cita está confirmada, las integraciones están activas
    if (cita.estado == EstadoCita.confirmada) {
      status['calendar_integrated'] = true;
      status['notifications_scheduled'] = true;
    }

    return status;
  }

  /// Método de conveniencia para procesar cita desde el servicio de citas
  Future<Map<String, dynamic>> handleAppointmentConfirmation(Cita cita) async {
    // Solo procesar si la cita está confirmada
    if (cita.estado != EstadoCita.confirmada) {
      return {
        'success': false,
        'message': 'La cita debe estar en estado confirmado para procesar integraciones'
      };
    }

    return await processConfirmedAppointment(cita);
  }
}
