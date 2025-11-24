import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../models/cita_model.dart';

class AppointmentBadges extends StatelessWidget {
  final Cita cita;

  const AppointmentBadges({super.key, required this.cita});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // Badge de urgencia
        if (_isUrgent()) _buildUrgencyBadge(),
        const SizedBox(width: 4),

        // Badge de tiempo restante
        _buildTimeRemainingBadge(),
        const SizedBox(width: 4),

        // Badge de recordatorio
        if (_hasReminder()) _buildReminderBadge(),
        const SizedBox(width: 4),

        // Badge de precio (si aplica)
        if (_hasPriceInfo()) _buildPriceBadge(),
      ],
    );
  }

  bool _isUrgent() {
    final now = DateTime.now();
    final timeDifference = cita.fechaHora.difference(now).inHours;
    return timeDifference > 0 && timeDifference <= 2;
  }

  bool _hasReminder() {
    // Lógica para verificar si tiene recordatorio activo
    return true; // Por ahora siempre true, se puede mejorar
  }

  bool _hasPriceInfo() {
    // Lógica para verificar si tiene información de precio
    return cita.servicio.contains('avaluos') || cita.servicio.contains('venta');
  }

  Widget _buildUrgencyBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.red.shade100,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.red.shade300, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.warning,
            size: 12,
            color: Colors.red.shade700,
          ),
          const SizedBox(width: 2),
          Text(
            'URGENTE',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Colors.red.shade700,
            ),
          ),
        ],
      ),
    )
        .animate(onPlay: (controller) => controller.repeat(reverse: true))
        .scale(begin: const Offset(1, 1), end: const Offset(1.1, 1.1), duration: 800.ms)
        .fade(begin: 1.0, end: 0.7, duration: 800.ms);
  }

  Widget _buildTimeRemainingBadge() {
    final now = DateTime.now();
    final difference = cita.fechaHora.difference(now);

    if (difference.isNegative) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.grey.shade300, width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.history,
              size: 12,
              color: Colors.grey.shade700,
            ),
            const SizedBox(width: 2),
            Text(
              'PASADA',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade700,
              ),
            ),
          ],
        ),
      );
    }

    final hours = difference.inHours;
    final minutes = difference.inMinutes % 60;

    String timeText;
    Color badgeColor;
    Color textColor;

    if (hours > 24) {
      final days = hours ~/ 24;
      timeText = '${days}d';
      badgeColor = Colors.blue.shade100;
      textColor = Colors.blue.shade700;
    } else if (hours > 0) {
      timeText = '${hours}h';
      badgeColor = hours <= 2 ? Colors.orange.shade100 : Colors.green.shade100;
      textColor = hours <= 2 ? Colors.orange.shade700 : Colors.green.shade700;
    } else {
      timeText = '${minutes}m';
      badgeColor = Colors.red.shade100;
      textColor = Colors.red.shade700;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: badgeColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: textColor.withOpacity(0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.schedule,
            size: 12,
            color: textColor,
          ),
          const SizedBox(width: 2),
          Text(
            timeText,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReminderBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.purple.shade100,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.purple.shade300, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.notifications,
            size: 12,
            color: Colors.purple.shade700,
          ),
          const SizedBox(width: 2),
          Text(
            'RECORDATORIO',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Colors.purple.shade700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceBadge() {
    // Simulación de precio basado en el servicio
    String priceText;
    if (cita.servicio.contains('avaluos')) {
      priceText = '\$50-200';
    } else if (cita.servicio.contains('venta')) {
      priceText = '\$100-500';
    } else {
      priceText = '\$30-150';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.green.shade100,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.green.shade300, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.attach_money,
            size: 12,
            color: Colors.green.shade700,
          ),
          const SizedBox(width: 2),
          Text(
            priceText,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Colors.green.shade700,
            ),
          ),
        ],
      ),
    );
  }
}

// Indicadores visuales adicionales
class AppointmentIndicators extends StatelessWidget {
  final Cita cita;

  const AppointmentIndicators({super.key, required this.cita});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _buildIndicator(
          icon: Icons.phone,
          label: 'Llamar',
          color: Colors.blue,
          onTap: () {
            // Implementar llamada telefónica
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Llamando a ${cita.telefono}')),
            );
          },
        ),
        _buildIndicator(
          icon: Icons.message,
          label: 'Mensaje',
          color: Colors.green,
          onTap: () {
            // Implementar envío de mensaje
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Enviando mensaje de recordatorio')),
            );
          },
        ),
        _buildIndicator(
          icon: Icons.location_on,
          label: 'Ubicación',
          color: Colors.red,
          onTap: () {
            // Implementar navegación a ubicación
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Abriendo mapa')),
            );
          },
        ),
        _buildIndicator(
          icon: Icons.calendar_today,
          label: 'Calendario',
          color: Colors.purple,
          onTap: () async {
            // Ya implementado en la card
          },
        ),
      ],
    );
  }

  Widget _buildIndicator({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: color.withOpacity(0.3), width: 1),
            ),
            child: Icon(
              icon,
              color: color,
              size: 20,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: color,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    )
        .animate()
        .scale(duration: 200.ms, curve: Curves.elasticOut)
        .fadeIn(duration: 200.ms);
  }
}

// Indicador de progreso para citas en proceso
class AppointmentProgressIndicator extends StatelessWidget {
  final Cita cita;

  const AppointmentProgressIndicator({super.key, required this.cita});

  @override
  Widget build(BuildContext context) {
    double progress = _calculateProgress();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: 60,
            height: 6,
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.grey.shade200,
              valueColor: AlwaysStoppedAnimation<Color>(_getProgressColor(progress)),
              borderRadius: BorderRadius.circular(3),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            _getProgressText(progress),
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: _getProgressColor(progress),
            ),
          ),
        ],
      ),
    );
  }

  double _calculateProgress() {
    final now = DateTime.now();

    if (cita.fechaHora.isBefore(now)) {
      // Cita ya pasó
      return cita.estado == EstadoCita.completada ? 1.0 : 0.0;
    }

    // Calcular progreso basado en tiempo hasta la cita
    final totalHours = 24.0; // Consideramos 24 horas como el período relevante
    final hoursUntil = cita.fechaHora.difference(now).inHours.toDouble();
    final progress = 1.0 - (hoursUntil / totalHours).clamp(0.0, 1.0);

    return progress;
  }

  Color _getProgressColor(double progress) {
    if (progress >= 0.8) return Colors.red;
    if (progress >= 0.6) return Colors.orange;
    if (progress >= 0.4) return Colors.yellow.shade700;
    return Colors.green;
  }

  String _getProgressText(double progress) {
    if (progress >= 0.8) return 'Crítico';
    if (progress >= 0.6) return 'Próximo';
    if (progress >= 0.4) return 'Pendiente';
    return 'Lejos';
  }
}
