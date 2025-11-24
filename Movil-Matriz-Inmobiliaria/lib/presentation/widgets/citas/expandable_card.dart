import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../models/cita_model.dart';
import '../../../services/calendar_service.dart';
import 'package:intl/intl.dart';

class ExpandableAppointmentCard extends StatefulWidget {
  final Cita cita;
  final Function(Cita) onCitaTap;
  final Function(Cita) onEstadoChange;
  final Function(Cita) onEdit;
  final Function(Cita) onDelete;

  const ExpandableAppointmentCard({
    super.key,
    required this.cita,
    required this.onCitaTap,
    required this.onEstadoChange,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  State<ExpandableAppointmentCard> createState() => _ExpandableAppointmentCardState();
}

class _ExpandableAppointmentCardState extends State<ExpandableAppointmentCard>
    with TickerProviderStateMixin {
  bool _isExpanded = false;
  late AnimationController _animationController;
  late Animation<double> _heightAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _heightAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _opacityAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _toggleExpanded() {
    setState(() {
      _isExpanded = !_isExpanded;
      if (_isExpanded) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final timeDifference = widget.cita.fechaHora.difference(now).inHours;
    final isUpcoming = timeDifference > 0 && timeDifference <= 2;
    final isVeryClose = timeDifference > 0 && timeDifference <= 1;

    return LongPressDraggable<Cita>(
      data: widget.cita,
      feedback: Material(
        elevation: 8,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: MediaQuery.of(context).size.width - 32,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: widget.cita.estadoColor, width: 2),
          ),
          child: Text(
            widget.cita.nombreCompleto,
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
      ),
      childWhenDragging: Opacity(
        opacity: 0.3,
        child: _buildCard(context, isUpcoming, isVeryClose),
      ),
      child: _buildCard(context, isUpcoming, isVeryClose),
    );
  }

  Widget _buildCard(BuildContext context, bool isUpcoming, bool isVeryClose) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isVeryClose ? Colors.red.withOpacity(0.5) : widget.cita.estadoColor.withOpacity(0.3),
          width: isVeryClose ? 3 : 2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.white.withOpacity(0.8),
            blurRadius: isUpcoming ? 16 : 12,
            offset: const Offset(-4, -4),
          ),
          BoxShadow(
            color: isVeryClose
                ? Colors.red.withOpacity(0.2)
                : Colors.black.withOpacity(0.1),
            blurRadius: isUpcoming ? 16 : 12,
            offset: const Offset(4, 4),
          ),
        ],
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white,
            isUpcoming ? Colors.orange.shade50 : Colors.grey.shade50,
          ],
        ),
      ),
      child: InkWell(
        onTap: _toggleExpanded,
        borderRadius: BorderRadius.circular(12),
        splashColor: widget.cita.estadoColor.withOpacity(0.1),
        highlightColor: widget.cita.estadoColor.withOpacity(0.05),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  // Status badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: widget.cita.estadoColor,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: widget.cita.estadoColor.withOpacity(0.3),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Text(
                      widget.cita.estadoTexto,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  )
                      .animate()
                      .scale(duration: 300.ms, curve: Curves.elasticOut)
                      .fadeIn(duration: 200.ms),
                  const Spacer(),
                  // Time and expand icon
                  Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            DateFormat('HH:mm').format(widget.cita.fechaHora),
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF0A4B84),
                            ),
                          ),
                          Text(
                            DateFormat('dd MMM yyyy', 'es').format(widget.cita.fechaHora),
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.normal,
                              color: Color(0xFF0A4B84),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 8),
                      AnimatedRotation(
                        turns: _isExpanded ? 0.5 : 0,
                        duration: const Duration(milliseconds: 300),
                        child: Icon(
                          Icons.expand_more,
                          color: const Color(0xFF0A4B84),
                          size: 24,
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 8),

              // Basic info
              Text(
                widget.cita.nombreCompleto,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),

              const SizedBox(height: 4),

              // Service info
              Row(
                children: [
                  const Icon(Icons.medical_services, size: 14, color: Colors.black54),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      widget.cita.servicio,
                      style: const TextStyle(fontSize: 13, color: Colors.black54),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),

              // Expanded content
              SizeTransition(
                sizeFactor: _heightAnimation,
                child: FadeTransition(
                  opacity: _opacityAnimation,
                  child: Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Contact info
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Información de Contacto',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF0A4B84),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(Icons.phone, size: 16, color: Colors.black54),
                                  const SizedBox(width: 8),
                                  Text(
                                    widget.cita.telefono,
                                    style: const TextStyle(fontSize: 14, color: Colors.black87),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.email, size: 16, color: Colors.black54),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      widget.cita.correo,
                                      style: const TextStyle(fontSize: 14, color: Colors.black87),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.badge, size: 16, color: Colors.black54),
                                  const SizedBox(width: 8),
                                  Text(
                                    '${widget.cita.tipoDocumento.name.toUpperCase()} ${widget.cita.numeroDocumento}',
                                    style: const TextStyle(fontSize: 14, color: Colors.black87),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 12),

                        // Details
                        if (widget.cita.detalles.isNotEmpty) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.blue.shade50,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.blue.shade200),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Detalles de la Cita',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF0A4B84),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  widget.cita.detalles,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    color: Colors.black87,
                                    height: 1.4,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                        ],

                        // Time until appointment
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isVeryClose
                                ? Colors.red.shade50
                                : isUpcoming
                                    ? Colors.orange.shade50
                                    : Colors.green.shade50,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: isVeryClose
                                  ? Colors.red.shade200
                                  : isUpcoming
                                      ? Colors.orange.shade200
                                      : Colors.green.shade200,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                isVeryClose
                                    ? Icons.warning
                                    : isUpcoming
                                        ? Icons.schedule
                                        : Icons.check_circle,
                                color: isVeryClose
                                    ? Colors.red
                                    : isUpcoming
                                        ? Colors.orange
                                        : Colors.green,
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _getTimeMessage(),
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: isVeryClose
                                        ? Colors.red.shade800
                                        : isUpcoming
                                            ? Colors.orange.shade800
                                            : Colors.green.shade800,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 12),
                      ],
                    ),
                  ),
                ),
              ),

              // Action buttons (always visible)
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  // Calendar button with pulse animation for urgent appointments
                  IconButton(
                    icon: Icon(
                      Icons.calendar_today,
                      size: 20,
                      color: const Color(0xFF9C27B0),
                    )
                        .animate(
                          onPlay: (controller) => isVeryClose ? controller.repeat() : null,
                        )
                        .scale(
                          begin: const Offset(1, 1),
                          end: const Offset(1.2, 1.2),
                          duration: 800.ms,
                          curve: Curves.easeInOut,
                        )
                        .then()
                        .scale(
                          begin: const Offset(1.2, 1.2),
                          end: const Offset(1, 1),
                          duration: 800.ms,
                          curve: Curves.easeInOut,
                        ),
                    color: const Color(0xFF9C27B0),
                    onPressed: () async {
                      final success = await CalendarService().addAppointmentToCalendar(widget.cita);
                      if (success && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Cita agregada al calendario'),
                            backgroundColor: Colors.green,
                          ),
                        );
                      }
                    },
                    tooltip: 'Agregar al calendario',
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  )
                      .animate()
                      .slideY(begin: 0.2, end: 0, duration: 400.ms, delay: 300.ms)
                      .fadeIn(duration: 400.ms, delay: 300.ms),
                  const SizedBox(width: 12),
                  IconButton(
                    icon: const Icon(Icons.swap_horiz, size: 20),
                    color: const Color(0xFF0A4B84),
                    onPressed: () => widget.onEstadoChange(widget.cita),
                    tooltip: 'Cambiar estado',
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  )
                      .animate()
                      .slideY(begin: 0.2, end: 0, duration: 450.ms, delay: 350.ms)
                      .fadeIn(duration: 450.ms, delay: 350.ms),
                  const SizedBox(width: 12),
                  IconButton(
                    icon: const Icon(Icons.edit, size: 20),
                    color: const Color(0xFF42A5F5),
                    onPressed: () => widget.onEdit(widget.cita),
                    tooltip: 'Editar',
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  )
                      .animate()
                      .slideY(begin: 0.2, end: 0, duration: 500.ms, delay: 400.ms)
                      .fadeIn(duration: 500.ms, delay: 400.ms),
                  const SizedBox(width: 12),
                  IconButton(
                    icon: const Icon(Icons.delete, size: 20),
                    color: const Color(0xFFEF5350),
                    onPressed: () => widget.onDelete(widget.cita),
                    tooltip: 'Eliminar',
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  )
                      .animate()
                      .slideY(begin: 0.2, end: 0, duration: 550.ms, delay: 450.ms)
                      .fadeIn(duration: 550.ms, delay: 450.ms),
                ],
              ),
            ],
          ),
        ),
      ),
    )
        .animate()
        .fadeIn(duration: 400.ms)
        .slideY(begin: 0.1, end: 0, duration: 400.ms, curve: Curves.easeOut)
        .scale(begin: const Offset(0.95, 0.95), end: const Offset(1, 1), duration: 300.ms, curve: Curves.easeOut);
  }

  String _getTimeMessage() {
    final now = DateTime.now();
    final difference = widget.cita.fechaHora.difference(now);

    if (difference.isNegative) {
      return 'Esta cita ya pasó';
    }

    final days = difference.inDays;
    final hours = difference.inHours % 24;
    final minutes = difference.inMinutes % 60;

    if (days > 0) {
      return 'Faltan $days días${hours > 0 ? ' y $hours horas' : ''}';
    } else if (hours > 0) {
      return 'Faltan $hours horas${minutes > 0 ? ' y $minutes minutos' : ''}';
    } else if (minutes > 0) {
      return 'Faltan $minutes minutos';
    } else {
      return 'La cita es ahora';
    }
  }
}
