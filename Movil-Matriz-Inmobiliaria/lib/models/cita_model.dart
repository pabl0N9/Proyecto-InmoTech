import 'package:intl/intl.dart';
import 'package:flutter/material.dart';

enum EstadoCita {
  solicitada,
  confirmada,
  cancelada,
  completada,
  reprogramada,
}

enum TipoDocumento {
  cedula,
  pasaporte,
  tarjetaIdentidad,
  registroCivil,
}

class Cita {
  final String id;
  final String nombreCompleto;
  final String telefono;
  final String correo;
  final TipoDocumento tipoDocumento;
  final String numeroDocumento;
  final DateTime fechaHora;
  final String servicio;
  final String detalles;
  EstadoCita estado;
  final DateTime fechaCreacion;

  // Información del agente asignado (solo para citas confirmadas)
  final String? agenteNombre;
  final String? agenteTelefono;
  final String? agenteCorreo;

  Cita({
    required this.id,
    required this.nombreCompleto,
    required this.telefono,
    required this.correo,
    required this.tipoDocumento,
    required this.numeroDocumento,
    required this.fechaHora,
    required this.servicio,
    required this.detalles,
    required this.estado,
    required this.fechaCreacion,
    this.agenteNombre,
    this.agenteTelefono,
    this.agenteCorreo,
  });

  // Convertir a JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombreCompleto': nombreCompleto,
      'telefono': telefono,
      'correo': correo,
      'tipoDocumento': tipoDocumento.index,
      'numeroDocumento': numeroDocumento,
      'fechaHora': fechaHora.toIso8601String(),
      'servicio': servicio,
      'detalles': detalles,
      'estado': estado.index,
      'fechaCreacion': fechaCreacion.toIso8601String(),
    };
  }

  // Crear desde JSON (compatible con API)
  factory Cita.fromJson(Map<String, dynamic> json) {
    // Manejar diferentes formatos de respuesta de la API
    final id = json['id_cita']?.toString() ?? json['id']?.toString() ?? '';

    // Construir nombre completo desde campos separados o usar campo directo
    String nombreCompleto;
    if (json['cliente'] is Map) {
      final cliente = json['cliente'] as Map<String, dynamic>;
      final primerNombre = cliente['primer_nombre'] ?? '';
      final segundoNombre = cliente['segundo_nombre'] ?? '';
      final primerApellido = cliente['primer_apellido'] ?? '';
      final segundoApellido = cliente['segundo_apellido'] ?? '';
      nombreCompleto = '$primerNombre $segundoNombre $primerApellido $segundoApellido'.trim();
    } else {
      nombreCompleto = json['nombreCompleto'] ?? '';
    }

    // Obtener teléfono
    final telefono = json['cliente']?['telefono'] ?? json['telefono'] ?? '';

    // Obtener correo
    final correo = json['cliente']?['correo'] ?? json['correo'] ?? '';

    // Tipo de documento
    TipoDocumento tipoDocumento;
    if (json['cliente']?['tipo_documento'] == 'CC') {
      tipoDocumento = TipoDocumento.cedula;
    } else if (json['cliente']?['tipo_documento'] == 'CE') {
      tipoDocumento = TipoDocumento.cedula; // Usar cédula como default
    } else {
      tipoDocumento = TipoDocumento.cedula; // Default
    }

    // Número de documento
    final numeroDocumento = json['cliente']?['numero_documento'] ?? json['numeroDocumento'] ?? '';

    // Fecha y hora
    DateTime fechaHora;
    try {
      if (json['fecha_cita'] != null && json['hora_inicio'] != null) {
        // Formato de API: fecha_cita + hora_inicio
        final fecha = json['fecha_cita'].toString();
        final hora = json['hora_inicio'].toString();

        // Si hora_inicio ya incluye fecha (formato completo), usar solo la hora
        if (hora.contains('T')) {
          // Extraer solo la parte de hora: "1970-01-01T13:30:00.000Z" -> "13:30:00"
          final horaPart = hora.split('T')[1].split('.')[0]; // "13:30:00"
          fechaHora = DateTime.parse('$fecha $horaPart');
        } else {
          // Hora en formato HH:MM o HH:MM:SS
          fechaHora = DateTime.parse('$fecha $hora');
        }
      } else if (json['fechaHora'] != null) {
        // Formato alternativo
        fechaHora = DateTime.parse(json['fechaHora']);
      } else {
        fechaHora = DateTime.now();
      }
    } catch (e) {
      print('Error al parsear fecha: fecha_cita=${json['fecha_cita']}, hora_inicio=${json['hora_inicio']}, error=$e');
      fechaHora = DateTime.now();
    }

    // Servicio
    String servicio;
    if (json['servicio'] is Map) {
      servicio = json['servicio']['nombre_servicio'] ?? 'Servicio';
    } else {
      servicio = json['servicio'] ?? 'Servicio';
    }

    // Detalles/Observaciones
    final detalles = json['observaciones'] ?? json['detalles'] ?? '';

    // Estado
    EstadoCita estado;
    if (json['estado'] is Map) {
      final idEstado = json['estado']['id_estado_cita'];
      if (idEstado != null && idEstado is int) {
        // Convertir ID de API (1-6) a índice de enum (0-4)
        switch (idEstado) {
          case 1:
            estado = EstadoCita.solicitada;
            break;
          case 2:
            estado = EstadoCita.confirmada;
            break;
          case 3:
            estado = EstadoCita.cancelada;
            break;
          case 4:
            estado = EstadoCita.completada;
            break;
          case 5:
            estado = EstadoCita.reprogramada;
            break;
          case 6:
            estado = EstadoCita.cancelada; // API usa 6 para cancelada
            break;
          default:
            estado = EstadoCita.solicitada;
        }
      } else {
        estado = EstadoCita.solicitada;
      }
    } else if (json['estado'] is int) {
      estado = EstadoCita.values[json['estado']];
    } else {
      estado = EstadoCita.solicitada;
    }

    // Fecha de creación
    DateTime fechaCreacion;
    if (json['fecha_creacion'] != null) {
      fechaCreacion = DateTime.parse(json['fecha_creacion']);
    } else if (json['fechaCreacion'] != null) {
      fechaCreacion = DateTime.parse(json['fechaCreacion']);
    } else {
      fechaCreacion = DateTime.now();
    }

    // Información del agente
    final agenteNombre = json['agente']?['primer_nombre'] ?? json['agenteNombre'];
    final agenteTelefono = json['agente']?['telefono'] ?? json['agenteTelefono'];
    final agenteCorreo = json['agente']?['correo'] ?? json['agenteCorreo'];

    return Cita(
      id: id,
      nombreCompleto: nombreCompleto,
      telefono: telefono,
      correo: correo,
      tipoDocumento: tipoDocumento,
      numeroDocumento: numeroDocumento,
      fechaHora: fechaHora,
      servicio: servicio,
      detalles: detalles,
      estado: estado,
      fechaCreacion: fechaCreacion,
      agenteNombre: agenteNombre,
      agenteTelefono: agenteTelefono,
      agenteCorreo: agenteCorreo,
    );
  }

  // Copiar con modificaciones
  Cita copyWith({
    String? id,
    String? nombreCompleto,
    String? telefono,
    String? correo,
    TipoDocumento? tipoDocumento,
    String? numeroDocumento,
    DateTime? fechaHora,
    String? servicio,
    String? detalles,
    EstadoCita? estado,
    DateTime? fechaCreacion,
  }) {
    return Cita(
      id: id ?? this.id,
      nombreCompleto: nombreCompleto ?? this.nombreCompleto,
      telefono: telefono ?? this.telefono,
      correo: correo ?? this.correo,
      tipoDocumento: tipoDocumento ?? this.tipoDocumento,
      numeroDocumento: numeroDocumento ?? this.numeroDocumento,
      fechaHora: fechaHora ?? this.fechaHora,
      servicio: servicio ?? this.servicio,
      detalles: detalles ?? this.detalles,
      estado: estado ?? this.estado,
      fechaCreacion: fechaCreacion ?? this.fechaCreacion,
    );
  }

  // Helpers para obtener texto legible
  String get tipoDocumentoTexto {
    switch (tipoDocumento) {
      case TipoDocumento.cedula:
        return 'Cédula';
      case TipoDocumento.pasaporte:
        return 'Pasaporte';
      case TipoDocumento.tarjetaIdentidad:
        return 'Tarjeta de Identidad';
      case TipoDocumento.registroCivil:
        return 'Registro Civil';
    }
  }

  String get estadoTexto {
    switch (estado) {
      case EstadoCita.solicitada:
        return 'Solicitada';
      case EstadoCita.confirmada:
        return 'Confirmada';
      case EstadoCita.cancelada:
        return 'Cancelada';
      case EstadoCita.completada:
        return 'Completada';
      case EstadoCita.reprogramada:
        return 'Reprogramada';
    }
  }

  Color get estadoColor {
    switch (estado) {
      case EstadoCita.solicitada:
        return const Color(0xFF6366F1); // Índigo (bg-indigo-100)
      case EstadoCita.confirmada:
        return const Color(0xFF10B981); // Verde (bg-green-100)
      case EstadoCita.cancelada:
        return const Color(0xFFEF4444); // Rojo (bg-red-100)
      case EstadoCita.completada:
        return const Color(0xFF8B5CF6); // Púrpura (bg-purple-100)
      case EstadoCita.reprogramada:
        return const Color(0xFFF97316); // Naranja (bg-orange-100)
    }
  }
}
