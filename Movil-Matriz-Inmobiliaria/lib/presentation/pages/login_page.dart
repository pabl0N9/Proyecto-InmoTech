import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'register_page.dart';
import '../../services/auth_service.dart';
import '../../models/user_model.dart';
import '../widgets/citas/alertas_modernas.dart';
// ⚠️ ELIMINAMOS la importación de home_page.dart.
// import 'home_page.dart';
// ✅ En su lugar, usaremos el nombre de la ruta '/home' que apunta a MainScreen.


class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  Future<void> _login() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      context.showModernToast(
        message: "Debes llenar todos los campos",
        type: AlertType.error,
      );
      return;
    }

    // Mostrar indicador de carga
    setState(() {});

    try {
      print('🔐 Intentando login con: $email');
      final result = await AuthService.login(email, password);
      print('📋 Resultado del login: $result');

      if (result['success'] == true) {
        print('✅ Login exitoso, guardando datos...');

        // Guardar datos de autenticación
        final prefs = await SharedPreferences.getInstance();
        final user = result['user'] as User;
        final token = result['token'] as String;

        await prefs.setString('auth_token', token);
        await prefs.setString('current_user', user.toJsonString());
        await prefs.setString('refresh_token', result['refreshToken'] ?? '');

        print('💾 Datos guardados en SharedPreferences');
        print('👤 Usuario: ${user.email}');
        print('🔑 Token guardado');

        context.showModernSuccess(
          message: "¡Bienvenido de vuelta!",
          onComplete: () {
            print('🏠 Navegando a /home...');
            // ✅ CAMBIO CLAVE: Navegar a la ruta '/home' definida en main.dart.
            // Esta ruta carga el widget MainScreen, que incluye el Header y el Menú.
            if (mounted) {
              Navigator.of(context).pushReplacementNamed('/home');
              print('✅ Navegación completada');
            } else {
              print('❌ Widget no está mounted');
            }
          },
        );
      } else {
        print('⚠️ Login fallido: ${result['message']}');
        context.showModernToast(
          message: result['message'] ?? 'Error desconocido',
          type: AlertType.warning,
        );
      }
    } catch (e) {
      print('❌ Error en login: $e');
      context.showModernToast(
        message: "Error de conexión. Inténtalo de nuevo.",
        type: AlertType.error,
      );
    } finally {
      // Ocultar indicador de carga
      if (mounted) {
        setState(() {});
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            // 🔹 Contenido principal en columna
            Column(
              children: [
                // Encabezado azul con logo centrado
                Container(
                  width: double.infinity,
                  color: const Color(0xFF003366),
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  child: Center(
                    child: Image.asset(
                      "assets/images/LogoSinFondo.png",
                      height: 60,
                    ),
                  ),
                ),

                // Contenedor blanco con borde redondeado
                Expanded(
                  child: Container(
                    margin: const EdgeInsets.all(15),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(5),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 6,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(20),
                      child: ConstrainedBox(
                        constraints: BoxConstraints(
                          minHeight: MediaQuery.of(context).size.height * 0.6,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            const SizedBox(height: 10),

                            const Text(
                              "Iniciar sesión",
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF003366),
                              ),
                            ),
                            const SizedBox(height: 30),

                            // Campo correo
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  "Correo electrónico",
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                TextField(
                                  controller: _emailController,
                                  decoration: InputDecoration(
                                    hintText: "Ingresa tu correo",
                                    prefixIcon:
                                        const Icon(Icons.email_outlined),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 20),
                              ],
                            ),

                            // Campo contraseña
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  "Contraseña",
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                TextField(
                                  controller: _passwordController,
                                  obscureText: true,
                                  decoration: InputDecoration(
                                    hintText: "Ingresa tu contraseña",
                                    prefixIcon:
                                        const Icon(Icons.lock_outline),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 10),
                              ],
                            ),

                            // Checkbox con mejor layout
                            Container(
                              width: double.infinity,
                              margin: const EdgeInsets.symmetric(vertical: 10),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Checkbox(
                                    value: false,
                                    onChanged: (value) {},
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(5),
                                    ),
                                  ),
                                  Expanded(
                                    child: Text(
                                      "Recordar sesión",
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: Colors.grey[700],
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 20),

                            // Botón login
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF003366),
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 15),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                                onPressed: _login,
                                child: const Text(
                                  "Iniciar sesión",
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 15),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),

            // 🔹 Botón Registrar flotante arriba a la derecha
            Positioned(
              top: 10,
              right: 15,
              child: GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const RegisterPage(),
                    ),
                  );
                },
                child: const Text(
                  "Registrar",
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
