import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../services/auth_service.dart';
import '../../models/user_model.dart';
import 'login_page.dart';
import '../widgets/citas/alertas_modernas.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();

  final _documentTypeController = TextEditingController();
  final _documentNumberController = TextEditingController();
  final _nameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  TipoDocumento _selectedDocumentType = TipoDocumento.CC;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _acceptTerms = false;
  String _passwordStrength = '';
  Color _passwordStrengthColor = Colors.grey;

  @override
  void initState() {
    super.initState();
    _passwordController.addListener(() {
      _checkPasswordStrength(_passwordController.text);
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _documentTypeController.dispose();
    _documentNumberController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _checkPasswordStrength(String password) {
    setState(() {
      if (password.isEmpty) {
        _passwordStrength = '';
        _passwordStrengthColor = Colors.grey;
        return;
      }

      int strength = 0;
      if (password.length >= 8) strength++;
      if (RegExp(r'[A-Z]').hasMatch(password)) strength++;
      if (RegExp(r'[a-z]').hasMatch(password)) strength++;
      if (RegExp(r'[0-9]').hasMatch(password)) strength++;
      if (RegExp(r'[!@#$%^&*(),.?":{}|<>]').hasMatch(password)) strength++;

      if (strength <= 2) {
        _passwordStrength = 'Débil';
        _passwordStrengthColor = Colors.red;
      } else if (strength <= 3) {
        _passwordStrength = 'Media';
        _passwordStrengthColor = Colors.orange;
      } else if (strength <= 4) {
        _passwordStrength = 'Fuerte';
        _passwordStrengthColor = Colors.blue;
      } else {
        _passwordStrength = 'Muy fuerte';
        _passwordStrengthColor = Colors.green;
      }
    });
  }

  Future<void> _register() async {
    if (!_acceptTerms) {
      context.showModernToast(
        message: "Debes aceptar los términos y condiciones",
        type: AlertType.warning,
      );
      return;
    }

    if (_formKey.currentState!.validate()) {
      // Mostrar indicador de carga
      setState(() {});

      try {
        final result = await AuthService.register(
          nombreCompleto: _nameController.text.trim(),
          apellidoCompleto: _lastNameController.text.trim(),
          email: _emailController.text.trim(),
          telefono: _phoneController.text.trim(),
          tipoDocumento: _selectedDocumentType,
          numeroDocumento: _documentNumberController.text.trim(),
          password: _passwordController.text.trim(),
          confirmPassword: _confirmPasswordController.text.trim(),
        );

        if (result['success']) {
          context.showModernSuccess(
            message: "¡Cuenta creada exitosamente!",
            onComplete: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const LoginPage()),
              );
            },
          );
        } else {
          context.showModernToast(
            message: result['message'] ?? 'Error en el registro',
            type: AlertType.warning,
          );
        }
      } catch (e) {
        context.showModernToast(
          message: "Error de conexión. Inténtalo de nuevo.",
          type: AlertType.error,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white, // 🔹 Fondo blanco
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                // 🔹 Espaciador superior
                Container(
                  width: double.infinity,
                  color: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 20),
                ),

                // 🔹 Formulario azul
                Expanded(
                  child: Container(
                    margin: const EdgeInsets.all(15),
                    decoration: BoxDecoration(
                      color: const Color(0xFF003366),
                      borderRadius: BorderRadius.circular(5),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 6,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(20),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            const SizedBox(height: 10),

                            const Text(
                              "Registro",
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 30),

                            // Campos de documento (igual que la web)
                            Row(
                              children: [
                                // Tipo de documento
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        "Tipo de Documento",
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w500,
                                          color: Colors.white,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      DropdownButtonFormField<TipoDocumento>(
                                        value: _selectedDocumentType,
                                        decoration: InputDecoration(
                                          filled: true,
                                          fillColor: Colors.white,
                                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                                          border: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                        ),
                                        items: TipoDocumento.values.map((tipo) {
                                          return DropdownMenuItem(
                                            value: tipo,
                                            child: Text(_getTipoDocumentoTexto(tipo)),
                                          );
                                        }).toList(),
                                        validator: (value) {
                                          if (value == null) {
                                            return "Selecciona un tipo";
                                          }
                                          return null;
                                        },
                                        onChanged: (value) {
                                          if (value != null) {
                                            setState(() => _selectedDocumentType = value);
                                          }
                                        },
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 16),
                                // Número de documento
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        "Número de Documento",
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w500,
                                          color: Colors.white,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      TextFormField(
                                        controller: _documentNumberController,
                                        keyboardType: TextInputType.number,
                                        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                                        decoration: InputDecoration(
                                          filled: true,
                                          fillColor: Colors.white,
                                          hintText: "Número de documento",
                                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                                          border: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                        ),
                                        validator: (value) {
                                          if (value == null || value.isEmpty) {
                                            return "Obligatorio";
                                          }
                                          if (value.length < 5) {
                                            return "Inválido";
                                          }
                                          return null;
                                        },
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),

                            // Campos de nombre y apellido (igual que la web)
                            Row(
                              children: [
                                // Nombre completo
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        "Nombre completo",
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w500,
                                          color: Colors.white,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      TextFormField(
                                        controller: _nameController,
                                        decoration: InputDecoration(
                                          filled: true,
                                          fillColor: Colors.white,
                                          hintText: "Tu nombre completo",
                                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                                          border: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                        ),
                                        validator: (value) {
                                          if (value == null || value.isEmpty) {
                                            return "Obligatorio";
                                          }
                                          if (!RegExp(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$')
                                              .hasMatch(value)) {
                                            return "Solo letras";
                                          }
                                          return null;
                                        },
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 16),
                                // Apellido completo
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        "Apellido completo",
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w500,
                                          color: Colors.white,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      TextFormField(
                                        controller: _lastNameController,
                                        decoration: InputDecoration(
                                          filled: true,
                                          fillColor: Colors.white,
                                          hintText: "Tu apellido completo",
                                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                                          border: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                        ),
                                        validator: (value) {
                                          if (value == null || value.isEmpty) {
                                            return "Obligatorio";
                                          }
                                          if (!RegExp(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$')
                                              .hasMatch(value)) {
                                            return "Solo letras";
                                          }
                                          return null;
                                        },
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),

                            // Campo correo
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  "Correo electrónico",
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                TextFormField(
                                  controller: _emailController,
                                  keyboardType: TextInputType.emailAddress,
                                  decoration: InputDecoration(
                                    filled: true,
                                    fillColor: Colors.white,
                                    hintText: "tu@email.com",
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return "El correo es obligatorio";
                                    }
                                    if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(value)) {
                                      return "Correo inválido";
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 20),
                              ],
                            ),

                            // Campo teléfono
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  "Teléfono",
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                TextFormField(
                                  controller: _phoneController,
                                  keyboardType: TextInputType.phone,
                                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                                  decoration: InputDecoration(
                                    filled: true,
                                    fillColor: Colors.white,
                                    hintText: "Tu número de teléfono",
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return "El teléfono es obligatorio";
                                    }
                                    if (value.length < 7) {
                                      return "Teléfono inválido";
                                    }
                                    return null;
                                  },
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
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                TextFormField(
                                  controller: _passwordController,
                                  obscureText: _obscurePassword,
                                  decoration: InputDecoration(
                                    filled: true,
                                    fillColor: Colors.white,
                                    hintText: "Crea una contraseña",
                                    prefixIcon: const Icon(Icons.lock_outline),
                                    suffixIcon: IconButton(
                                      icon: Icon(
                                        _obscurePassword ? Icons.visibility : Icons.visibility_off,
                                      ),
                                      onPressed: () {
                                        setState(() {
                                          _obscurePassword = !_obscurePassword;
                                        });
                                      },
                                    ),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return "La contraseña es obligatoria";
                                    }
                                    if (value.length < 8) {
                                      return "Debe tener al menos 8 caracteres";
                                    }
                                    return null;
                                  },
                                ),
                                if (_passwordStrength.isNotEmpty) ...[
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Text(
                                        'Fuerza: $_passwordStrength',
                                        style: TextStyle(
                                          color: _passwordStrengthColor,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: LinearProgressIndicator(
                                          value: _getPasswordStrengthValue(),
                                          backgroundColor: Colors.grey.shade300,
                                          valueColor: AlwaysStoppedAnimation<Color>(_passwordStrengthColor),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                                const SizedBox(height: 20),
                              ],
                            ),

                            // Campo confirmar contraseña
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  "Confirmar contraseña",
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                TextFormField(
                                  controller: _confirmPasswordController,
                                  obscureText: _obscureConfirmPassword,
                                  decoration: InputDecoration(
                                    filled: true,
                                    fillColor: Colors.white,
                                    hintText: "Repite tu contraseña",
                                    prefixIcon: const Icon(Icons.lock_reset),
                                    suffixIcon: IconButton(
                                      icon: Icon(
                                        _obscureConfirmPassword ? Icons.visibility : Icons.visibility_off,
                                      ),
                                      onPressed: () {
                                        setState(() {
                                          _obscureConfirmPassword = !_obscureConfirmPassword;
                                        });
                                      },
                                    ),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return "Confirma tu contraseña";
                                    }
                                    if (value != _passwordController.text) {
                                      return "Las contraseñas no coinciden";
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 20),
                              ],
                            ),

                            // Checkbox de términos y condiciones
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: Colors.white.withOpacity(0.2),
                                ),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Checkbox(
                                    value: _acceptTerms,
                                    onChanged: (value) {
                                      setState(() {
                                        _acceptTerms = value ?? false;
                                      });
                                    },
                                    activeColor: const Color(0xFF00457B),
                                    checkColor: Colors.white,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: RichText(
                                      text: TextSpan(
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 14,
                                          height: 1.4,
                                        ),
                                        children: [
                                          const TextSpan(text: 'Acepto los '),
                                          TextSpan(
                                            text: 'términos y condiciones',
                                            style: const TextStyle(
                                              color: Color(0xFF00457B),
                                              fontWeight: FontWeight.w600,
                                              decoration: TextDecoration.underline,
                                            ),
                                          ),
                                          const TextSpan(text: ' y la '),
                                          TextSpan(
                                            text: 'política de privacidad',
                                            style: const TextStyle(
                                              color: Color(0xFF00457B),
                                              fontWeight: FontWeight.w600,
                                              decoration: TextDecoration.underline,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 20),

                            // Botón Registrar
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                      vertical: 15),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                                onPressed: _register, // 👈 ahora registra y redirige
                                child: const Text(
                                  "Registrar",
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Color(0xFF003366),
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

            // 🔹 Botón Volver flotante arriba a la derecha
            Positioned(
              top: 20,
              right: 20,
              child: GestureDetector(
                onTap: () {
                  Navigator.pop(context);
                },
                child: const Text(
                  "Volver",
                  style: TextStyle(
                    color: Color(0xFF003366),
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

  double _getPasswordStrengthValue() {
    if (_passwordStrength == 'Débil') return 0.2;
    if (_passwordStrength == 'Media') return 0.4;
    if (_passwordStrength == 'Fuerte') return 0.7;
    if (_passwordStrength == 'Muy fuerte') return 1.0;
    return 0.0;
  }

  String _getTipoDocumentoTexto(TipoDocumento tipo) {
    switch (tipo) {
      case TipoDocumento.CC:
        return 'Cédula de Ciudadanía';
      case TipoDocumento.CE:
        return 'Cédula de Extranjería';
      case TipoDocumento.NIT:
        return 'NIT';
      case TipoDocumento.PASAPORTE:
        return 'Pasaporte';
      case TipoDocumento.TI:
        return 'Tarjeta de Identidad';
    }
  }
}
