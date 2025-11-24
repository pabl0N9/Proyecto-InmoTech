import 'package:flutter/material.dart';
import '../../../models/cita_model.dart';

class FiltrosBar extends StatelessWidget {
  final EstadoCita? estadoSeleccionado;
  final DateTime? fechaInicio;
  final DateTime? fechaFin;
  final Function(EstadoCita?) onEstadoChanged;
  final Function(DateTime?, DateTime?) onFechasChanged;
  final VoidCallback onLimpiarFiltros;

  const FiltrosBar({
    super.key,
    required this.estadoSeleccionado,
    required this.fechaInicio,
    required this.fechaFin,
    required this.onEstadoChanged,
    required this.onFechasChanged,
    required this.onLimpiarFiltros,
  });

  @override
  Widget build(BuildContext context) {
    final bool hayFiltrosActivos = estadoSeleccionado != null || fechaInicio != null || fechaFin != null;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFiltroChip(
                    context,
                    'Estado',
                    estadoSeleccionado != null ? _getEstadoTexto(estadoSeleccionado!) : 'Todos',
                    estadoSeleccionado != null,
                    () => _mostrarSelectorEstado(context),
                  ),
                  const SizedBox(width: 8),
                  _buildFiltroChip(
                    context,
                    'Fechas',
                    fechaInicio != null ? 'Filtrado' : 'Todas',
                    fechaInicio != null,
                    () => _mostrarSelectorFechas(context),
                  ),
                ],
              ),
            ),
          ),
          if (hayFiltrosActivos) ...[
            const SizedBox(width: 8),
            IconButton(
              icon: const Icon(Icons.clear_all, color: Color(0xFFEF5350)),
              onPressed: onLimpiarFiltros,
              tooltip: 'Limpiar filtros',
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildFiltroChip(BuildContext context, String label, String value, bool isActive, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF0A4B84) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isActive ? const Color(0xFF0A4B84) : Colors.black12,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '$label: $value',
              style: TextStyle(
                color: isActive ? Colors.white : Colors.black87,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.arrow_drop_down,
              color: isActive ? Colors.white : Colors.black54,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  void _mostrarSelectorEstado(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Filtrar por Estado',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ListTile(
              title: const Text('Todos'),
              leading: Radio<EstadoCita?>(
                value: null,
                groupValue: estadoSeleccionado,
                onChanged: (value) {
                  onEstadoChanged(value);
                  Navigator.pop(context);
                },
              ),
            ),
            ...EstadoCita.values.map((estado) {
              return ListTile(
                title: Text(_getEstadoTexto(estado)),
                leading: Radio<EstadoCita?>(
                  value: estado,
                  groupValue: estadoSeleccionado,
                  onChanged: (value) {
                    onEstadoChanged(value);
                    Navigator.pop(context);
                  },
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  void _mostrarSelectorFechas(BuildContext context) async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      initialDateRange: fechaInicio != null && fechaFin != null
          ? DateTimeRange(start: fechaInicio!, end: fechaFin!)
          : null,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF0A4B84),
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      onFechasChanged(picked.start, picked.end);
    }
  }

  String _getEstadoTexto(EstadoCita estado) {
    switch (estado) {
      case EstadoCita.solicitada:
        return 'Solicitada';
      case EstadoCita.confirmada:
        return 'Confirmada';
      case EstadoCita.completada:
        return 'Completada';
      case EstadoCita.cancelada:
        return 'Cancelada';
      case EstadoCita.reprogramada:
        return 'Reprogramada';
    }
  }
}
