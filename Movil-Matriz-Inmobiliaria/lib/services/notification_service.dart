import 'dart:typed_data';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:audioplayers/audioplayers.dart';
import '../models/cita_model.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();
  final AudioPlayer _audioPlayer = AudioPlayer();

  Future<void> initialize() async {
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
      requestCriticalPermission: true,
    );

    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );

    await _flutterLocalNotificationsPlugin.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        // Handle notification tap
        print('Notification tapped: ${response.payload}');
        _handleNotificationTap(response.payload);
      },
      onDidReceiveBackgroundNotificationResponse: _handleBackgroundNotification,
    );

    // Request permissions for iOS
    await _flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
            IOSFlutterLocalNotificationsPlugin>()
        ?.requestPermissions(
          alert: true,
          badge: true,
          sound: true,
          critical: true,
        );

    // Initialize audio player
    await _audioPlayer.setReleaseMode(ReleaseMode.stop);
  }

  void _handleNotificationTap(String? payload) {
    if (payload != null) {
      print('🔔 Notification tapped with payload: $payload');
      // Aquí puedes navegar a la pantalla de citas o mostrar detalles
    }
  }

  static void _handleBackgroundNotification(NotificationResponse response) {
    print('🔔 Background notification: ${response.payload}');
  }

  Future<void> scheduleAppointmentReminder(Cita cita) async {
    final scheduledDate = cita.fechaHora.subtract(const Duration(hours: 1));

    // Only schedule if the appointment is in the future
    if (scheduledDate.isBefore(DateTime.now())) {
      return;
    }

    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'appointment_reminders',
      'Appointment Reminders',
      channelDescription: 'Reminders for upcoming appointments',
      importance: Importance.max,
      priority: Priority.high,
      showWhen: true,
      enableLights: true,
      enableVibration: true,
      playSound: true,
    );

    const DarwinNotificationDetails iOSPlatformChannelSpecifics =
        DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
      iOS: iOSPlatformChannelSpecifics,
    );

    await _flutterLocalNotificationsPlugin.zonedSchedule(
      cita.id.hashCode,
      'Recordatorio de Cita',
      'Tienes una cita en 1 hora: ${cita.nombreCompleto} - ${cita.servicio}',
      tz.TZDateTime.from(scheduledDate, tz.local),
      platformChannelSpecifics,
      androidAllowWhileIdle: true,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      matchDateTimeComponents: DateTimeComponents.time,
    );
  }

  Future<void> scheduleAppointmentConfirmation(Cita cita) async {
    final scheduledDate = cita.fechaHora.subtract(const Duration(minutes: 15));

    if (scheduledDate.isBefore(DateTime.now())) {
      return;
    }

    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'appointment_confirmations',
      'Appointment Confirmations',
      channelDescription: 'Confirmations for upcoming appointments',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
    );

    const DarwinNotificationDetails iOSPlatformChannelSpecifics =
        DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
      iOS: iOSPlatformChannelSpecifics,
    );

    await _flutterLocalNotificationsPlugin.zonedSchedule(
      cita.id.hashCode + 1000, // Different ID for confirmation
      'Cita Próxima',
      'Tu cita con ${cita.nombreCompleto} comienza en 15 minutos',
      tz.TZDateTime.from(scheduledDate, tz.local),
      platformChannelSpecifics,
      androidAllowWhileIdle: true,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
    );
  }

  Future<void> showInstantNotification(String title, String body) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'instant_notifications',
      'Instant Notifications',
      channelDescription: 'Instant notifications for app events',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
    );

    const DarwinNotificationDetails iOSPlatformChannelSpecifics =
        DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
      iOS: iOSPlatformChannelSpecifics,
    );

    await _flutterLocalNotificationsPlugin.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      body,
      platformChannelSpecifics,
    );
  }

  Future<void> cancelAppointmentNotifications(int appointmentId) async {
    // Cancelar todas las notificaciones relacionadas con la cita
    await _flutterLocalNotificationsPlugin.cancel(appointmentId.hashCode);        // 1h antes
    await _flutterLocalNotificationsPlugin.cancel(appointmentId.hashCode + 1000); // 15min antes
    await _flutterLocalNotificationsPlugin.cancel(appointmentId.hashCode + 2000); // 24h antes
    await _flutterLocalNotificationsPlugin.cancel(appointmentId.hashCode + 3000); // 5min antes
  }

  /// Programa notificaciones avanzadas para citas con sonidos y alarmas
  Future<void> scheduleAdvancedAppointmentNotifications(Cita cita) async {
    // Solo programar si la cita está en el futuro
    if (cita.fechaHora.isBefore(DateTime.now())) {
      print('⚠️ No se programan notificaciones para citas pasadas');
      return;
    }

    // Notificación 24 horas antes (recordatorio temprano)
    await _scheduleNotificationWithSound(
      id: cita.id.hashCode + 2000,
      title: '📅 Recordatorio de Cita Mañana',
      body: 'Mañana tienes una cita con ${cita.nombreCompleto} a las ${cita.fechaHora.hour}:${cita.fechaHora.minute.toString().padLeft(2, '0')}',
      scheduledDate: cita.fechaHora.subtract(const Duration(hours: 24)),
      soundEnabled: false, // Sin sonido para notificaciones lejanas
      priority: Priority.defaultPriority,
    );

    // Notificación 1 hora antes (con sonido)
    await _scheduleNotificationWithSound(
      id: cita.id.hashCode,
      title: '⏰ Recordatorio: Cita en 1 hora',
      body: 'Tu cita con ${cita.nombreCompleto} comienza en 1 hora\nServicio: ${cita.servicio}',
      scheduledDate: cita.fechaHora.subtract(const Duration(hours: 1)),
      soundEnabled: true,
      priority: Priority.high,
    );

    // Notificación 15 minutos antes (con sonido urgente)
    await _scheduleNotificationWithSound(
      id: cita.id.hashCode + 1000,
      title: '🚨 ¡Cita en 15 minutos!',
      body: 'Tu cita con ${cita.nombreCompleto} comienza en 15 minutos\n📍 Matriz Inmobiliaria',
      scheduledDate: cita.fechaHora.subtract(const Duration(minutes: 15)),
      soundEnabled: true,
      priority: Priority.max,
    );

    // Notificación 5 minutos antes (alarma final)
    await _scheduleNotificationWithSound(
      id: cita.id.hashCode + 3000,
      title: '🚨 ¡Cita en 5 minutos!',
      body: '¡Tu cita comienza en 5 minutos!\nCliente: ${cita.nombreCompleto}',
      scheduledDate: cita.fechaHora.subtract(const Duration(minutes: 5)),
      soundEnabled: true,
      priority: Priority.max,
      vibrationPattern: [0, 1000, 500, 1000, 500, 1000], // Patrón de vibración urgente
    );

    print('✅ Notificaciones avanzadas programadas para cita: ${cita.id}');
  }

  /// Método auxiliar para programar notificaciones con sonido
  Future<void> _scheduleNotificationWithSound({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
    required bool soundEnabled,
    required Priority priority,
    List<int>? vibrationPattern,
  }) async {
    if (scheduledDate.isBefore(DateTime.now())) {
      return; // No programar notificaciones pasadas
    }

    final AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'appointment_advanced_${priority.index}',
      'Citas Avanzadas ${priority.name}',
      channelDescription: 'Notificaciones avanzadas para citas con sonidos y alarmas',
      importance: priority == Priority.max ? Importance.max : Importance.high,
      priority: priority,
      showWhen: true,
      enableLights: true,
      enableVibration: true,
      playSound: soundEnabled,
      vibrationPattern: vibrationPattern != null ? Int64List.fromList(vibrationPattern) : null,
      sound: soundEnabled ? RawResourceAndroidNotificationSound('notification') : null,
      styleInformation: BigTextStyleInformation(body),
      fullScreenIntent: priority == Priority.max, // Pantalla completa para alarmas urgentes
    );

    final DarwinNotificationDetails iOSPlatformChannelSpecifics =
        DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: soundEnabled,
      sound: soundEnabled ? 'notification.wav' : null,
      interruptionLevel: priority == Priority.max
          ? InterruptionLevel.critical
          : InterruptionLevel.active,
    );

    final NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
      iOS: iOSPlatformChannelSpecifics,
    );

    await _flutterLocalNotificationsPlugin.zonedSchedule(
      id,
      title,
      body,
      tz.TZDateTime.from(scheduledDate, tz.local),
      platformChannelSpecifics,
      androidAllowWhileIdle: true,
      uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
      payload: 'appointment_${id}', // Payload para identificar la notificación
    );
  }

  /// Reproduce sonido de notificación
  Future<void> playNotificationSound() async {
    try {
      await _audioPlayer.play(AssetSource('sounds/notification.mp3'));
    } catch (e) {
      print('Error reproduciendo sonido: $e');
    }
  }

  /// Reproduce sonido de alarma
  Future<void> playAlarmSound() async {
    try {
      await _audioPlayer.setReleaseMode(ReleaseMode.loop);
      await _audioPlayer.play(AssetSource('sounds/alarm.mp3'));
    } catch (e) {
      print('Error reproduciendo alarma: $e');
    }
  }

  /// Detiene cualquier sonido reproduciéndose
  Future<void> stopSound() async {
    await _audioPlayer.stop();
  }

  /// Muestra notificación inmediata con sonido
  Future<void> showImmediateNotificationWithSound({
    required String title,
    required String body,
    bool playSound = true,
    Priority priority = Priority.high,
  }) async {
    final AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'immediate_notifications',
      'Notificaciones Inmediatas',
      channelDescription: 'Notificaciones inmediatas con sonido',
      importance: Importance.high,
      priority: priority,
      showWhen: true,
      enableLights: true,
      enableVibration: true,
      playSound: true,
      sound: RawResourceAndroidNotificationSound('notification'),
    );

    final DarwinNotificationDetails iOSPlatformChannelSpecifics =
        DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
      sound: 'notification.wav',
    );

    final NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
      iOS: iOSPlatformChannelSpecifics,
    );

    await _flutterLocalNotificationsPlugin.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      body,
      platformChannelSpecifics,
    );

    // Reproducir sonido adicional si se solicita
    if (playSound) {
      await playNotificationSound();
    }
  }



  Future<void> cancelAllNotifications() async {
    await _flutterLocalNotificationsPlugin.cancelAll();
    await stopSound();
  }

  /// Verifica si las notificaciones están habilitadas
  Future<bool> areNotificationsEnabled() async {
    final androidImplementation = _flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    if (androidImplementation != null) {
      return await androidImplementation.areNotificationsEnabled() ?? false;
    }
    return true; // Asumir habilitado en otras plataformas
  }

  /// Solicita permisos de notificación
  Future<bool> requestNotificationPermissions() async {
    final androidImplementation = _flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    if (androidImplementation != null) {
      return await androidImplementation.requestNotificationsPermission() ?? false;
    }

    final iOSImplementation = _flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<IOSFlutterLocalNotificationsPlugin>();
    if (iOSImplementation != null) {
      return await iOSImplementation.requestPermissions(
        alert: true,
        badge: true,
        sound: true,
        critical: true,
      ) ?? false;
    }

    return true;
  }
}
