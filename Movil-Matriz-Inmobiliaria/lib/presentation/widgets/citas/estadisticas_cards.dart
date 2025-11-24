import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../models/cita_model.dart';

class EstadisticasCards extends StatelessWidget {
  final Map<EstadoCita, int> estadisticas;
  final int total;
  final Function(EstadoCita?)? onEstadoTap;

  const EstadisticasCards({
    super.key,
    required this.estadisticas,
    required this.total,
    this.onEstadoTap,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 160,
      child: Center(
        child: SingleChildScrollView(
          scrollDirection: Axis.vertical,
          child: Wrap(
            spacing: 12,
            runSpacing: 12,
            alignment: WrapAlignment.center,
            children: [
              _buildCard(
                'Total',
                total.toString(),
                const Color(0xFF0A4B84),
                Icons.calendar_today,
                null,
              ),
              _buildCard(
                'Solicitadas',
                estadisticas[EstadoCita.solicitada].toString(),
                const Color(0xFFFFA726),
                Icons.schedule,
                EstadoCita.solicitada,
              ),
              _buildCard(
                'Confirmadas',
                estadisticas[EstadoCita.confirmada].toString(),
                const Color(0xFF42A5F5),
                Icons.check_circle_outline,
                EstadoCita.confirmada,
              ),
              _buildCard(
                'Completadas',
                estadisticas[EstadoCita.completada].toString(),
                const Color(0xFF66BB6A),
                Icons.done_all,
                EstadoCita.completada,
              ),
              _buildCard(
                'Canceladas',
                estadisticas[EstadoCita.cancelada].toString(),
                const Color(0xFFEF5350),
                Icons.cancel_outlined,
                EstadoCita.cancelada,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCard(String label, String value, Color color, IconData icon, EstadoCita? estado) {
    final intValue = int.tryParse(value) ?? 0;
    return GestureDetector(
      onTap: () => onEstadoTap?.call(estado),
      child: Container(
        width: 120,
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            // Neumorphism effect
            BoxShadow(
              color: Colors.white.withOpacity(0.8),
              blurRadius: 10,
              offset: const Offset(-3, -3),
            ),
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(3, 3),
            ),
          ],
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white,
              Colors.grey.shade50,
            ],
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 28)
                .animate()
                .scale(duration: 300.ms, curve: Curves.elasticOut),
            const SizedBox(height: 8),
            TweenAnimationBuilder<int>(
              tween: IntTween(begin: 0, end: intValue),
              duration: const Duration(milliseconds: 800),
              builder: (context, animatedValue, child) {
                return Text(
                  animatedValue.toString(),
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                );
              },
            ),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: Colors.black54,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      )
          .animate()
          .fadeIn(duration: 400.ms)
          .slideY(begin: 0.2, end: 0, duration: 400.ms, curve: Curves.easeOut),
    );
  }
}
