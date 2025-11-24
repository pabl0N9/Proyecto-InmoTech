import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> with TickerProviderStateMixin {
  late AnimationController _logoController;
  late AnimationController _textController;
  late Animation<double> _logoAnimation;
  late Animation<double> _textAnimation;

  @override
  void initState() {
    super.initState();

    // Controlador para la animación del logo
    _logoController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );

    // Controlador para la animación del texto
    _textController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );

    // Animación de escala para el logo
    _logoAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _logoController,
      curve: Curves.elasticOut,
    ));

    // Animación de opacidad para el texto
    _textAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _textController,
      curve: Curves.easeIn,
    ));

    // Iniciar animaciones
    _logoController.forward().then((_) {
      _textController.forward();
    });

    // Espera 4 segundos y luego navega a la página principal
    Future.delayed(const Duration(seconds: 4), () {
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/login');
    });
  }

  @override
  void dispose() {
    _logoController.dispose();
    _textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF0A4B84),
              Color(0xFF1565C0),
              Color(0xFF1976D2),
            ],
          ),
        ),
        child: Stack(
          children: [
            // Partículas de fondo animadas
            ..._buildBackgroundParticles(),

            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Logo con animación de escala
                  AnimatedBuilder(
                    animation: _logoAnimation,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: _logoAnimation.value,
                        child: Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white.withOpacity(0.1),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.white.withOpacity(0.2),
                                blurRadius: 20,
                                spreadRadius: 5,
                              ),
                            ],
                          ),
                          child: Image.asset(
                            'assets/images/LogoSinFondo.png',
                            width: 120,
                            height: 120,
                          ),
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: 30),

                  // Texto con animación de opacidad
                  AnimatedBuilder(
                    animation: _textAnimation,
                    builder: (context, child) {
                      return Opacity(
                        opacity: _textAnimation.value,
                        child: Column(
                          children: [
                            const Text(
                              'InmoTech',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 32,
                                letterSpacing: 2,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Tu aliado inmobiliario',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.8),
                                fontSize: 16,
                                letterSpacing: 1,
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: 50),

                  // Indicador de carga animado
                  FadeIn(
                    delay: const Duration(milliseconds: 2000),
                    child: const SizedBox(
                      width: 40,
                      height: 40,
                      child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        strokeWidth: 3,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Texto de derechos en la parte inferior
            Positioned(
              bottom: 30,
              left: 0,
              right: 0,
              child: FadeInUp(
                delay: const Duration(milliseconds: 2500),
                child: Column(
                  children: [
                    Text(
                      '© 2025 InmoTech',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Versión 1.0.0',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.4),
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildBackgroundParticles() {
    return List.generate(20, (index) {
      return Positioned(
        left: (index * 37.5) % MediaQuery.of(context).size.width,
        top: (index * 42.3) % MediaQuery.of(context).size.height,
        child: FadeIn(
          delay: Duration(milliseconds: index * 100),
          child: Container(
            width: 4,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
          ),
        ),
      );
    });
  }
}
