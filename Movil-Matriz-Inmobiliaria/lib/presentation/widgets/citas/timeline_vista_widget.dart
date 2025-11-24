import 'package:flutter/material.dart';
import '../../../models/cita_model.dart';
import 'package:intl/intl.dart';

class TimelineVistaWidget extends StatelessWidget {
  final List<Cita> citas;
  final Function(Cita) onCitaTap;
  final Function(Cita) onEstadoChange;
  final Function(Cita) onEdit;
  final Function(Cita) onDelete;

  const TimelineVistaWidget({
    super.key,
    required this.citas,
    required this.onCitaTap,
    required this.onEstadoChange,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    if (citas.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32.0),
          child: Text(
            'No hay citas programadas',
            style: TextStyle(color: Colors.black38, fontSize: 16),
          ),
        ),
      );
    }

    // Ordenar citas por fecha
    final citasOrdenadas = List<Cita>.from(citas)
      ..sort((a, b) => a.fechaHora.compareTo(b.fechaHora));

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: citasOrdenadas.length,
      itemBuilder: (context, index) {
        final cita = citasOrdenadas[index];
        final isLast = index == citasOrdenadas.length - 1;
        final isFirst = index == 0;

        return TimelineItem(
          cita: cita,
          isFirst: isFirst,
          isLast: isLast,
          onTap: () => onCitaTap(cita),
          onEstadoChange: () => onEstadoChange(cita),
          onEdit: () => onEdit(cita),
          onDelete: () => onDelete(cita),
        );
      },
    );
  }
}

class TimelineItem extends StatelessWidget {
  final Cita cita;
  final bool isFirst;
  final bool isLast;
  final VoidCallback onTap;
  final VoidCallback onEstadoChange;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const TimelineItem({
    super.key,
    required this.cita,
    required this.isFirst,
    required this.isLast,
    required this.onTap,
    required this.onEstadoChange,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final isPast = cita.fechaHora.isBefore(now);
    final isToday = cita.fechaHora.day == now.day &&
                   cita.fechaHora.month == now.month &&
                   cita.fechaHora.year == now.year;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Timeline line and dot
        SizedBox(
          width: 60,
          child: Column(
            children: [
              if (!isFirst) Container(
                width: 2,
                height: 20,
                color: Colors.grey.shade300,
              ),
              Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  color: isPast ? Colors.grey : cita.estadoColor,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.white,
                    width: 3,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: (isPast ? Colors.grey : cita.estadoColor).withOpacity(0.3),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
              ),
              if (!isLast) Container(
                width: 2,
                height: 60,
                color: Colors.grey.shade300,
              ),
            ],
          ),
        ),

        // Content
        Expanded(
          child: Container(
            margin: const EdgeInsets.only(bottom: 16, left: 8),
            child: Card(
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: InkWell(
                onTap: onTap,
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Date and time header
                      Row(
                        children: [
                          Icon(
                            isToday ? Icons.today : Icons.event,
                            size: 18,
                            color: isPast ? Colors.grey : const Color(0xFF0A4B84),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            isToday
                                ? 'Hoy'
                                : DateFormat('dd MMM yyyy', 'es').format(cita.fechaHora),
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: isPast ? Colors.grey : const Color(0xFF0A4B84),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            DateFormat('HH:mm').format(cita.fechaHora),
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: isPast ? Colors.grey : const Color(0xFF0A4B84),
                            ),
                          ),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: cita.estadoColor.withOpacity(isPast ? 0.5 : 1.0),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              cita.estadoTexto,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 12),

                      // Client info
                      Text(
                        cita.nombreCompleto,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isPast ? Colors.grey.shade600 : Colors.black87,
                        ),
                      ),

                      const SizedBox(height: 8),

                      // Service and contact info
                      Row(
                        children: [
                          Icon(
                            Icons.medical_services,
                            size: 16,
                            color: isPast ? Colors.grey.shade500 : Colors.black54,
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              cita.servicio,
                              style: TextStyle(
                                fontSize: 14,
                                color: isPast ? Colors.grey.shade500 : Colors.black54,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 4),

                      Row(
                        children: [
                          Icon(
                            Icons.phone,
                            size: 16,
                            color: isPast ? Colors.grey.shade500 : Colors.black54,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            cita.telefono,
                            style: TextStyle(
                              fontSize: 14,
                              color: isPast ? Colors.grey.shade500 : Colors.black54,
                            ),
                          ),
                        ],
                      ),

                      if (cita.detalles.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          cita.detalles,
                          style: TextStyle(
                            fontSize: 13,
                            color: isPast ? Colors.grey.shade500 : Colors.black54,
                            fontStyle: FontStyle.italic,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],

                      // Action buttons
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          IconButton(
                            icon: Icon(
                              Icons.swap_horiz,
                              size: 20,
                              color: isPast ? Colors.grey : const Color(0xFF0A4B84),
                            ),
                            onPressed: isPast ? null : onEstadoChange,
                            tooltip: 'Cambiar estado',
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                          const SizedBox(width: 12),
                          IconButton(
                            icon: Icon(
                              Icons.edit,
                              size: 20,
                              color: isPast ? Colors.grey : const Color(0xFF42A5F5),
                            ),
                            onPressed: isPast ? null : onEdit,
                            tooltip: 'Editar',
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                          const SizedBox(width: 12),
                          IconButton(
                            icon: Icon(
                              Icons.delete,
                              size: 20,
                              color: isPast ? Colors.grey : const Color(0xFFEF5350),
                            ),
                            onPressed: isPast ? null : onDelete,
                            tooltip: 'Eliminar',
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
