import 'dart:convert';
import 'package:flutter/material.dart';

enum TipoDocumento {
  CC,
  CE,
  NIT,
  PASAPORTE,
  TI,
}

enum RolUsuario {
  usuario,
  propietario,
  administrador,
}

class User {
  final int id;
  final String nombreCompleto;
  final String apellidoCompleto;
  final String email;
  final List<String> roles;
  final bool esAdministrativo;
  final Map<String, dynamic> permisos;

  User({
    required this.id,
    required this.nombreCompleto,
    required this.apellidoCompleto,
    required this.email,
    required this.roles,
    required this.esAdministrativo,
    required this.permisos,
  });

  // Convertir a JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre_completo': nombreCompleto,
      'apellido_completo': apellidoCompleto,
      'email': email,
      'roles': roles,
      'es_administrativo': esAdministrativo,
      'permisos': permisos,
    };
  }

  // Convertir a JSON string para SharedPreferences
  String toJsonString() {
    return jsonEncode(toJson());
  }

  // Crear desde JSON
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      nombreCompleto: json['nombre_completo'] as String? ?? json['nombreCompleto'] as String? ?? '',
      apellidoCompleto: json['apellido_completo'] as String? ?? json['apellidoCompleto'] as String? ?? '',
      email: json['email'] as String,
      roles: List<String>.from(json['roles'] ?? []),
      esAdministrativo: json['es_administrativo'] as bool? ?? false,
      permisos: Map<String, dynamic>.from(json['permisos'] ?? {}),
    );
  }

  // Helpers para obtener texto legible
  String get nombreCompletoTexto => '$nombreCompleto $apellidoCompleto'.trim();

  String get rolesTexto => roles.join(', ');

  bool get esSuperAdmin => roles.contains('Super Administrador');

  bool get esEmpleado => roles.contains('Empleado');

  bool get puedeVerCitas => permisos['gCitas']?['ver'] == true || esSuperAdmin;
}
