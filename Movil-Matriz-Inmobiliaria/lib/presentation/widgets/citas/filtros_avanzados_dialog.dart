import 'package:flutter/material.dart';
import '../../../models/cita_model.dart';

class FiltrosAvanzadosDialog extends StatefulWidget {
  final EstadoCita? estadoSeleccionado;
  final DateTime? fechaInicio;
  final DateTime? fechaFin;
  final String? servicioSeleccionado;
  final bool? soloUrgentes;
  final double? precioMin;
  final double? precioMax;
  final Function(EstadoCita?, DateTime?, DateTime?, String?, bool?, double?, double?) onFiltrosAplicados;

  const FiltrosAvanzadosDialog({
    super.key,
    this.estadoSeleccionado,
    this.fechaInicio,
    this.fechaFin,
    this.servicioSeleccionado,
    this.soloUrgentes,
    this.precioMin,
    this.precioMax,
    required this.onFiltrosAplicados,
  });

  @override
  State<FiltrosAvanzadosDialog> createState() => _FiltrosAvanzadosDialogState();
}

class _FiltrosAvanzadosDialogState extends State<FiltrosAvanzadosDialog> {
  EstadoCita? _estadoSeleccionado;
  DateTime? _fechaInicio;
  DateTime? _fechaFin;
  String? _servicioSeleccionado;
  bool _soloUrgentes = false;
  double _precioMin = 0;
  double _precioMax = 1000000;

  final List<String> _serviciosDisponibles = [
    'avaluos',
    'gestion_alquileres',
    'asesoria_legal',
    'venta_inmuebles',
    'compra_inmuebles',
    'consultoria',
  ];

  final Map<String, String> _serviciosLabels = {
    'avaluos': 'Avaluos',
    'gestion_alquileres': 'Gestión de Alquileres',
    'asesoria_legal': 'Asesoría Legal',
    'venta_inmuebles': 'Venta de Inmuebles',
    'compra_inmuebles': 'Compra de Inmuebles',
    'consultoria': 'Consultoría Inmobiliaria',
  };

  @override
  void initState() {
    super.initState();
    _estadoSeleccionado = widget.estadoSeleccionado;
    _fechaInicio = widget.fechaInicio;
    _fechaFin = widget.fechaFin;
    _servicioSeleccionado = widget.servicioSeleccionado;
    _soloUrgentes = widget.soloUrgentes ?? false;
    _precioMin = widget.precioMin ?? 0;
    _precioMax = widget.precioMax ?? 1000000;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.8,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildHeader(),
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildEstadoSection(),
                  const SizedBox(height: 24),
                  _buildFechaSection(),
                  const SizedBox(height: 24),
                  _buildServicioSection(),
                  const SizedBox(height: 24),
                  _buildUrgenciaSection(),
                  const SizedBox(height: 24),
                  _buildPrecioSection(),
                  const SizedBox(height: 32),
                  _buildActionButtons(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: Color(0xFF0A4B84),
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Row(
        children: [
          const Icon(Icons.filter_list, color: Colors.white, size: 28),
          const SizedBox(width: 12),
          const Text(
            'Filtros Avanzados',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const Spacer(),
          IconButton(
            icon: const Icon(Icons.close, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
    );
  }

  Widget _buildEstadoSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Estado de la Cita',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF0A4B84),
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _buildEstadoChip(null, 'Todos'),
            ...EstadoCita.values.map((estado) => _buildEstadoChip(estado, _getEstadoTexto(estado))),
          ],
        ),
      ],
    );
  }

  Widget _buildEstadoChip(EstadoCita? estado, String label) {
    final isSelected = _estadoSeleccionado == estado;
    return GestureDetector(
      onTap: () => setState(() => _estadoSeleccionado = estado),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0A4B84) : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF0A4B84) : Colors.grey.shade300,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.black87,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildFechaSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Rango de Fechas',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF0A4B84),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildFechaField('Desde', _fechaInicio, (date) => setState(() => _fechaInicio = date)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildFechaField('Hasta', _fechaFin, (date) => setState(() => _fechaFin = date)),
            ),
          ],
        ),
        const SizedBox(height: 8),
        TextButton.icon(
          onPressed: () => setState(() {
            _fechaInicio = null;
            _fechaFin = null;
          }),
          icon: const Icon(Icons.clear, size: 16),
          label: const Text('Limpiar fechas'),
          style: TextButton.styleFrom(
            foregroundColor: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }

  Widget _buildFechaField(String label, DateTime? date, Function(DateTime?) onDateSelected) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.grey,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 4),
        InkWell(
          onTap: () async {
            final picked = await showDatePicker(
              context: context,
              initialDate: date ?? DateTime.now(),
              firstDate: DateTime(2020),
              lastDate: DateTime(2030),
              builder: (context, child) => Theme(
                data: Theme.of(context).copyWith(
                  colorScheme: const ColorScheme.light(primary: Color(0xFF0A4B84)),
                ),
                child: child!,
              ),
            );
            if (picked != null) onDateSelected(picked);
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.calendar_today,
                  size: 16,
                  color: date != null ? const Color(0xFF0A4B84) : Colors.grey,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    date != null
                        ? '${date.day}/${date.month}/${date.year}'
                        : 'Seleccionar',
                    style: TextStyle(
                      fontSize: 14,
                      color: date != null ? Colors.black87 : Colors.grey,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildServicioSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Tipo de Servicio',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF0A4B84),
          ),
        ),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          value: _servicioSeleccionado,
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.grey, width: 1.5),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: _servicioSeleccionado != null
                    ? const Color(0xFF0A4B84)
                    : Colors.grey.shade300,
                width: 1.5,
              ),
            ),
            focusedBorder: const OutlineInputBorder(
              borderRadius: BorderRadius.all(Radius.circular(12)),
              borderSide: BorderSide(color: Color(0xFF0A4B84), width: 2),
            ),
          ),
          hint: const Text('Todos los servicios'),
          items: [
            const DropdownMenuItem<String>(
              value: null,
              child: Text('Todos los servicios'),
            ),
            ..._serviciosDisponibles.map((servicio) {
              return DropdownMenuItem<String>(
                value: servicio,
                child: Text(_serviciosLabels[servicio] ?? servicio),
              );
            }).toList(),
          ],
          onChanged: (value) => setState(() => _servicioSeleccionado = value),
        ),
      ],
    );
  }

  Widget _buildUrgenciaSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Urgencia',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF0A4B84),
          ),
        ),
        const SizedBox(height: 12),
        SwitchListTile(
          title: const Text('Solo citas urgentes'),
          subtitle: const Text('Citas en las próximas 2 horas'),
          value: _soloUrgentes,
          onChanged: (value) => setState(() => _soloUrgentes = value),
          activeColor: const Color(0xFF0A4B84),
        ),
      ],
    );
  }

  Widget _buildPrecioSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Rango de Precio (Estimado)',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF0A4B84),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                initialValue: _precioMin.toStringAsFixed(0),
                decoration: const InputDecoration(
                  labelText: 'Mínimo',
                  prefixText: '\$',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                onChanged: (value) {
                  final parsed = double.tryParse(value);
                  if (parsed != null) setState(() => _precioMin = parsed);
                },
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: TextFormField(
                initialValue: _precioMax.toStringAsFixed(0),
                decoration: const InputDecoration(
                  labelText: 'Máximo',
                  prefixText: '\$',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                onChanged: (value) {
                  final parsed = double.tryParse(value);
                  if (parsed != null) setState(() => _precioMax = parsed);
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Rango: \$${(_precioMin).toStringAsFixed(0)} - \$${(_precioMax).toStringAsFixed(0)}',
          style: const TextStyle(
            fontSize: 12,
            color: Colors.grey,
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons() {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: () {
              setState(() {
                _estadoSeleccionado = null;
                _fechaInicio = null;
                _fechaFin = null;
                _servicioSeleccionado = null;
                _soloUrgentes = false;
                _precioMin = 0;
                _precioMax = 1000000;
              });
            },
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              side: const BorderSide(color: Colors.grey),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              'Limpiar Todo',
              style: TextStyle(color: Colors.grey, fontSize: 16),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: ElevatedButton(
            onPressed: _aplicarFiltros,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0A4B84),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              'Aplicar Filtros',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
            ),
          ),
        ),
      ],
    );
  }

  void _aplicarFiltros() {
    widget.onFiltrosAplicados(
      _estadoSeleccionado,
      _fechaInicio,
      _fechaFin,
      _servicioSeleccionado,
      _soloUrgentes,
      _precioMin,
      _precioMax,
    );
    Navigator.pop(context);
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
