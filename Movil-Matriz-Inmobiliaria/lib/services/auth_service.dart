import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user_model.dart';

class AuthService {
  // Para Flutter Web, usar la IP del host local en lugar de localhost
  static const String baseUrl = 'http://127.0.0.1:5000/api/v1'; // Cambiar según tu configuración

  // Login
  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        print('🔍 Respuesta cruda de la API: ${response.body}');
        final responseData = jsonDecode(response.body);
        print('📦 Datos decodificados: $responseData');

        if (responseData is Map && responseData.containsKey('data')) {
          final data = responseData['data'];
          print('🎯 Data extraída: $data');

          if (data is Map && data.containsKey('user') && (data.containsKey('accessToken') || data.containsKey('token'))) {
            return {
              'success': true,
              'user': User.fromJson(data['user']),
              'token': data['accessToken'] ?? data['token'],
              'refreshToken': data['refreshToken'],
            };
          } else {
            return {
              'success': false,
              'message': 'Formato de respuesta inválido',
            };
          }
        } else {
          // Si no hay estructura {success, message, data}, asumir respuesta directa
          return {
            'success': true,
            'user': User.fromJson(responseData['user'] ?? responseData),
            'token': responseData['accessToken'] ?? responseData['token'] ?? '',
            'refreshToken': responseData['refreshToken'],
          };
        }
      } else {
        try {
          final error = jsonDecode(response.body);
          return {
            'success': false,
            'message': error['message'] ?? 'Error en el login',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Error desconocido en el servidor',
          };
        }
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Registro
  static Future<Map<String, dynamic>> register({
    required String nombreCompleto,
    required String apellidoCompleto,
    required String email,
    required String telefono,
    required TipoDocumento tipoDocumento,
    required String numeroDocumento,
    required String password,
    required String confirmPassword,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'tipo_documento': tipoDocumento.name,
          'numero_documento': numeroDocumento,
          'nombre_completo': nombreCompleto,
          'apellido_completo': apellidoCompleto,
          'email': email,
          'telefono': telefono,
          'password': password,
          'confirmPassword': confirmPassword,
        }),
      );

      if (response.statusCode == 201) {
        final responseData = jsonDecode(response.body);
        final data = responseData['data']; // La API devuelve { success, message, data }
        return {
          'success': true,
          'user': User.fromJson(data['user']),
          'token': data['token'],
        };
      } else {
        final error = jsonDecode(response.body);
        return {
          'success': false,
          'message': error['message'] ?? 'Error en el registro',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Verificar token
  static Future<Map<String, dynamic>> verifyToken(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/auth/verify'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'user': User.fromJson(data['user']),
        };
      } else {
        return {
          'success': false,
          'message': 'Token inválido',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }
}
