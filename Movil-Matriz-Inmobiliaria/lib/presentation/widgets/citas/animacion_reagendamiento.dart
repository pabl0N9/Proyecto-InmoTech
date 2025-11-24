import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../models/cita_model.dart';

class AnimacionReagendamiento extends StatefulWidget {
  final Cita cita;
  final DateTime fechaOriginal;
  final DateTime fechaNueva;
  final VoidCallback onAnimationComplete;

  const AnimacionReagendamiento({
    super.key,
    required this.cita,
    required this.fechaOriginal,
    required this.fechaNueva,
    required this.onAnimationComplete,
  });

  @override
  State<AnimacionReagendamiento> createState() => _AnimacionReagendamientoState();
}

class _AnimacionReagendamientoState extends State<AnimacionReagendamiento>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late AnimationController _scaleController;
  late AnimationController _slideController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();

    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _scaleController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );

    _slideController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    ));

    _scaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _scaleController,
      curve: Curves.elasticOut,
    ));

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, -0.5),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOutBack,
    ));

    _startAnimationSequence();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _scaleController.dispose();
    _slideController.dispose();
    super.dispose();
  }

  void _startAnimationSequence() async {
    // Primera fase: fade in
    await _fadeController.forward();

    // Segunda fase: scale bounce
    await _scaleController.forward();

    // Tercera fase: slide down
    await _slideController.forward();

    // Esperar un momento antes de completar
    await Future.delayed(const Duration(milliseconds: 500));

    widget.onAnimationComplete();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black54,
      child: Center(
        child: AnimatedBuilder(
          animation: Listenable.merge([_fadeAnimation, _scaleAnimation, _slideAnimation]),
          builder: (context, child) {
            return FadeTransition(
              opacity: _fadeAnimation,
              child: SlideTransition(
                position: _slideAnimation,
                child: ScaleTransition(
                  scale: _scaleAnimation,
                  child: _buildAnimationContent(),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildAnimationContent() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 32),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Icono de éxito con animación
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.green.shade100,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.event_available,
              color: Colors.green,
              size: 40,
            ),
          )
              .animate()
              .scale(duration: 300.ms, curve: Curves.elasticOut)
              .fadeIn(duration: 200.ms),

          const SizedBox(height: 20),

          // Título
          const Text(
            'Cita Reagendada',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF0A4B84),
            ),
          )
              .animate()
              .slideY(begin: 0.2, end: 0, duration: 400.ms, delay: 200.ms)
              .fadeIn(duration: 400.ms, delay: 200.ms),

          const SizedBox(height: 16),

          // Detalles de la cita
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                Text(
                  widget.cita.nombreCompleto,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  widget.cita.servicio,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.black54,
                  ),
                ),
              ],
            ),
          )
              .animate()
              .slideY(begin: 0.3, end: 0, duration: 400.ms, delay: 400.ms)
              .fadeIn(duration: 400.ms, delay: 400.ms),

          const SizedBox(height: 16),

          // Fechas con animación de transición
          Row(
            children: [
              Expanded(
                child: _buildFechaCard(
                  'De',
                  widget.fechaOriginal,
                  Colors.red.shade50,
                  Colors.red,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: const Icon(
                  Icons.arrow_forward,
                  color: Color(0xFF0A4B84),
                  size: 24,
                ),
              ),
              Expanded(
                child: _buildFechaCard(
                  'A',
                  widget.fechaNueva,
                  Colors.green.shade50,
                  Colors.green,
                ),
              ),
            ],
          )
              .animate()
              .slideY(begin: 0.4, end: 0, duration: 400.ms, delay: 600.ms)
              .fadeIn(duration: 400.ms, delay: 600.ms),

          const SizedBox(height: 24),

          // Botón de confirmación
          ElevatedButton(
            onPressed: widget.onAnimationComplete,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0A4B84),
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              'Entendido',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          )
              .animate()
              .slideY(begin: 0.5, end: 0, duration: 400.ms, delay: 800.ms)
              .fadeIn(duration: 400.ms, delay: 800.ms),
        ],
      ),
    );
  }

  Widget _buildFechaCard(String label, DateTime fecha, Color backgroundColor, Color textColor) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: textColor.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: textColor.withOpacity(0.8),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${fecha.day}/${fecha.month}',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
          Text(
            '${fecha.year}',
            style: TextStyle(
              fontSize: 12,
              color: textColor.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }
}

// Widget helper para mostrar animación de reagendamiento
class ReagendamientoAnimationHelper {
  static void showReagendamientoAnimation(
    BuildContext context,
    Cita cita,
    DateTime fechaOriginal,
    DateTime fechaNueva,
    VoidCallback onComplete,
  ) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AnimacionReagendamiento(
        cita: cita,
        fechaOriginal: fechaOriginal,
        fechaNueva: fechaNueva,
        onAnimationComplete: () {
          Navigator.of(context).pop();
          onComplete();
        },
      ),
    );
  }
}
