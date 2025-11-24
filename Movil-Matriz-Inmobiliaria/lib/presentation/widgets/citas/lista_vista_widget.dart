import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../models/cita_model.dart';

class ListaVistaWidget extends StatelessWidget {
  final List<Cita> citas;
  final Function(Cita) onCitaTap;
  final Function(Cita) onEstadoChange;
  final Function(Cita) onEdit;
  final Function(Cita) onDelete;

  const ListaVistaWidget({
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
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.event_busy, size: 64, color: Colors.black26),
              SizedBox(height: 16),
              Text(
                'No hay citas',
                style: TextStyle(
                  color: Colors.black38,
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Agrupar citas por fecha
    final citasAgrupadas = <DateTime, List<Cita>>{};
    for (var cita in citas) {
      final fecha = DateTime(cita.fechaHora.year, cita.fechaHora.month, cita.fechaHora.day);
      citasAgrupadas.putIfAbsent(fecha, () => []).add(cita);
    }

    final fechasOrdenadas = citasAgrupadas.keys.toList()..sort();

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: fechasOrdenadas.length,
      itemBuilder: (context, index) {
        final fecha = fechasOrdenadas[index];
        final citasDia = citasAgrupadas[fecha]!;
        citasDia.sort((a, b) => a.fechaHora.compareTo(b.fechaHora));

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Text(
                DateFormat('EEEE, dd MMMM yyyy', 'es').format(fecha),
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0A4B84),
                ),
              ),
            ),
            ...citasDia.map((cita) => _buildCitaCard(context, cita)).toList(),
            const SizedBox(height: 8),
          ],
        );
      },
    );
  }

  Widget _buildCitaCard(BuildContext context, Cita cita) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: cita.estadoColor.withOpacity(0.3), width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: () => onCitaTap(cita),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: cita.estadoColor,
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
                  const Spacer(),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        DateFormat('HH:mm').format(cita.fechaHora),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0A4B84),
                        ),
                      ),
                      Text(
                        DateFormat('dd MMM yyyy', 'es').format(cita.fechaHora),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.normal,
                          color: Color(0xFF0A4B84),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                cita.nombreCompleto,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.phone, size: 14, color: Colors.black54),
                  const SizedBox(width: 4),
                  Text(
                    cita.telefono,
                    style: const TextStyle(fontSize: 13, color: Colors.black54),
                  ),
                  const SizedBox(width: 12),
                  const Icon(Icons.medical_services, size: 14, color: Colors.black54),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      cita.servicio,
                      style: const TextStyle(fontSize: 13, color: Colors.black54),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  IconButton(
                    icon: const Icon(Icons.swap_horiz, size: 20),
                    color: const Color(0xFF0A4B84),
                    onPressed: () => onEstadoChange(cita),
                    tooltip: 'Cambiar estado',
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                  const SizedBox(width: 12),
                  IconButton(
                    icon: const Icon(Icons.edit, size: 20),
                    color: const Color(0xFF42A5F5),
                    onPressed: () => onEdit(cita),
                    tooltip: 'Editar',
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                  const SizedBox(width: 12),
                  IconButton(
                    icon: const Icon(Icons.delete, size: 20),
                    color: const Color(0xFFEF5350),
                    onPressed: () => onDelete(cita),
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
    );
  }
}
