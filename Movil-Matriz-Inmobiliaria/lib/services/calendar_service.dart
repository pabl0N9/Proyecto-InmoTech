import 'package:add_2_calendar/add_2_calendar.dart';
import '../models/cita_model.dart';

class CalendarService {
  static final CalendarService _instance = CalendarService._internal();
  factory CalendarService() => _instance;
  CalendarService._internal();

  /// Agrega una cita al calendario nativo/Google Calendar usando add_2_calendar
  Future<bool> addAppointmentToCalendar(Cita cita) async {
    try {
      final event = Event(
        title: '🏠 Cita - ${cita.servicio}',
        description: '''
Cita agendada en Matriz Inmobiliaria

👤 Cliente: ${cita.nombreCompleto}
📞 Teléfono: ${cita.telefono}
✉️ Email: ${cita.correo}
🏷️ Servicio: ${cita.servicio}
📝 Detalles: ${cita.detalles.isNotEmpty ? cita.detalles : 'Sin detalles adicionales'}
📅 Estado: ${cita.estadoTexto}

*Evento creado automáticamente por la app Matriz Inmobiliaria*
        ''',
        location: 'Matriz Inmobiliaria',
        startDate: cita.fechaHora,
        endDate: cita.fechaHora.add(const Duration(minutes: 30)), // Duración típica de cita
        allDay: false,
        iosParams: const IOSParams(
          reminder: Duration(minutes: 15), // Recordatorio automático en iOS
        ),
        androidParams: const AndroidParams(
          emailInvites: [], // emails can be added in this list
        ),
      );

      final result = await Add2Calendar.addEvent2Cal(event);
      print('✅ Cita agregada al calendario: $result');
      return result;
    } catch (e) {
      print('❌ Error al agregar cita al calendario: $e');
      return false;
    }
  }

  /// Agrega recordatorios separados al calendario
  Future<bool> addAppointmentReminderToCalendar(Cita cita) async {
    try {
      // Recordatorio 1 hora antes
      final reminder1h = Event(
        title: '⏰ Recordatorio: Cita en 1 hora',
        description: 'Tu cita con ${cita.nombreCompleto} comienza en 1 hora\nServicio: ${cita.servicio}\n📍 Matriz Inmobiliaria',
        location: 'Matriz Inmobiliaria',
        startDate: cita.fechaHora.subtract(const Duration(hours: 1)),
        endDate: cita.fechaHora.subtract(const Duration(hours: 1)).add(const Duration(minutes: 15)),
        allDay: false,
        iosParams: const IOSParams(reminder: Duration(minutes: 5)),
        androidParams: const AndroidParams(),
      );

      // Recordatorio 15 minutos antes
      final reminder15m = Event(
        title: '🚨 Cita en 15 minutos',
        description: 'Tu cita con ${cita.nombreCompleto} comienza en 15 minutos\nServicio: ${cita.servicio}\n📍 Matriz Inmobiliaria',
        location: 'Matriz Inmobiliaria',
        startDate: cita.fechaHora.subtract(const Duration(minutes: 15)),
        endDate: cita.fechaHora.subtract(const Duration(minutes: 15)).add(const Duration(minutes: 5)),
        allDay: false,
        iosParams: const IOSParams(reminder: Duration(minutes: 2)),
        androidParams: const AndroidParams(),
      );

      final result1h = await Add2Calendar.addEvent2Cal(reminder1h);
      final result15m = await Add2Calendar.addEvent2Cal(reminder15m);

      print('✅ Recordatorios agregados al calendario: 1h=$result1h, 15m=$result15m');
      return result1h && result15m;
    } catch (e) {
      print('❌ Error al agregar recordatorios al calendario: $e');
      return false;
    }
  }

  /// Método principal: Agrega cita y recordatorios a todos los calendarios disponibles
  Future<Map<String, bool>> addAppointmentToAllCalendars(Cita cita) async {
    final results = <String, bool>{};

    // Agregar la cita principal
    results['appointment'] = await addAppointmentToCalendar(cita);

    // Agregar recordatorios
    results['reminders'] = await addAppointmentReminderToCalendar(cita);

    return results;
  }

  /// Método simplificado para compatibilidad
  Future<bool> addAppointmentWithReminders(Cita cita) async {
    final results = await addAppointmentToAllCalendars(cita);
    return results['appointment'] == true && results['reminders'] == true;
  }
}
