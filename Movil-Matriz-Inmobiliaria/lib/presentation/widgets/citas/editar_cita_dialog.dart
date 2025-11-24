import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../../../models/cita_model.dart';

class EditarCitaDialog extends StatefulWidget {
  final Cita cita;

  const EditarCitaDialog({super.key, required this.cita});

  @override
  State<EditarCitaDialog> createState() => _EditarCitaDialogState();
}

class _EditarCitaDialogState extends State<EditarCitaDialog> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nombreController;
  late TextEditingController _telefonoController;
  late TextEditingController _correoController;
  late TextEditingController _numeroDocumentoController;
  // late TextEditingController _servicioController;
  String? _servicioSeleccionado;
  late TextEditingController _detallesController;
  
  late TipoDocumento _tipoDocumento;
  late DateTime _fechaSeleccionada;
  late TimeOfDay _horaSeleccionada;
  late EstadoCita _estado;

  @override
  void initState() {
    super.initState();
    _nombreController = TextEditingController(text: widget.cita.nombreCompleto);
    _telefonoController = TextEditingController(text: widget.cita.telefono);
    _correoController = TextEditingController(text: widget.cita.correo);
    _numeroDocumentoController = TextEditingController(text: widget.cita.numeroDocumento);
    // _servicioController = TextEditingController(text: widget.cita.servicio);
    // Only set servicio if it's one of the valid options
    final validServicios = ['avaluos', 'gestion_alquileres', 'asesoria_legal', 'venta_inmuebles', 'compra_inmuebles', 'consultoria'];
    _servicioSeleccionado = validServicios.contains(widget.cita.servicio) ? widget.cita.servicio : null;
    _detallesController = TextEditingController(text: widget.cita.detalles);

    _tipoDocumento = widget.cita.tipoDocumento;
    _fechaSeleccionada = widget.cita.fechaHora;
    _horaSeleccionada = TimeOfDay.fromDateTime(widget.cita.fechaHora);
    _estado = widget.cita.estado;
  }

  @override
  void dispose() {
    _nombreController.dispose();
    _telefonoController.dispose();
    _correoController.dispose();
    _numeroDocumentoController.dispose();
    // _servicioController.dispose();
    _detallesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        constraints: const BoxConstraints(maxHeight: 650),
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Datos Personales',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0A4B84),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _nombreController,
                        decoration: const InputDecoration(
                          labelText: 'Nombre Completo',
                          prefixIcon: Icon(Icons.person),
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) =>
                            value?.isEmpty ?? true ? 'Requerido' : null,
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _telefonoController,
                              decoration: const InputDecoration(
                                labelText: 'Teléfono',
                                prefixIcon: Icon(Icons.phone),
                                border: OutlineInputBorder(),
                              ),
                              keyboardType: TextInputType.phone,
                              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                              validator: (value) =>
                                  value?.isEmpty ?? true ? 'Requerido' : null,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              controller: _correoController,
                              decoration: const InputDecoration(
                                labelText: 'Correo',
                                prefixIcon: Icon(Icons.email),
                                border: OutlineInputBorder(),
                              ),
                              keyboardType: TextInputType.emailAddress,
                              validator: (value) {
                                if (value?.isEmpty ?? true) return 'Requerido';
                                if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
                                    .hasMatch(value!)) {
                                  return 'Inválido';
                                }
                                return null;
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            flex: 1,
                            child: DropdownButtonFormField<TipoDocumento>(
                              value: _tipoDocumento,
                              decoration: const InputDecoration(
                                labelText: 'Tipo Documento',
                                border: OutlineInputBorder(),
                              ),
                              items: TipoDocumento.values.map((tipo) {
                                return DropdownMenuItem(
                                  value: tipo,
                                  child: Text(_getTipoDocumentoTexto(tipo)),
                                );
                              }).toList(),
                              onChanged: (value) {
                                if (value != null) {
                                  setState(() => _tipoDocumento = value);
                                }
                              },
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            flex: 2,
                            child: TextFormField(
                              controller: _numeroDocumentoController,
                              decoration: const InputDecoration(
                                labelText: 'N° Documento',
                                border: OutlineInputBorder(),
                              ),
                              validator: (value) =>
                                  value?.isEmpty ?? true ? 'Requerido' : null,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        'Fecha y Hora',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0A4B84),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: InkWell(
                              onTap: _seleccionarFecha,
                              child: InputDecorator(
                                decoration: const InputDecoration(
                                  labelText: 'Fecha',
                                  prefixIcon: Icon(Icons.calendar_today),
                                  border: OutlineInputBorder(),
                                ),
                                child: Text(
                                  DateFormat('dd/MM/yyyy').format(_fechaSeleccionada),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: InkWell(
                              onTap: _seleccionarHora,
                              child: InputDecorator(
                                decoration: const InputDecoration(
                                  labelText: 'Hora',
                                  prefixIcon: Icon(Icons.access_time),
                                  border: OutlineInputBorder(),
                                ),
                                child: Text(_horaSeleccionada.format(context)),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        'Servicio y Detalles',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0A4B84),
                        ),
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        value: _servicioSeleccionado,
                        decoration: const InputDecoration(
                          labelText: 'Servicio',
                          prefixIcon: Icon(Icons.medical_services),
                          border: OutlineInputBorder(),
                        ),
                        items: const [
                          DropdownMenuItem(value: 'avaluos', child: Text('Avaluos')),
                          DropdownMenuItem(value: 'gestion_alquileres', child: Text('Gestión de Alquileres')),
                          DropdownMenuItem(value: 'asesoria_legal', child: Text('Asesoría Legal')),
                          DropdownMenuItem(value: 'venta_inmuebles', child: Text('Venta de Inmuebles')),
                          DropdownMenuItem(value: 'compra_inmuebles', child: Text('Compra de Inmuebles')),
                          DropdownMenuItem(value: 'consultoria', child: Text('Consultoría Inmobiliaria')),
                        ],
                        validator: (value) =>
                            value == null || value.isEmpty ? 'Requerido' : null,
                        onChanged: (value) {
                          setState(() {
                            _servicioSeleccionado = value;
                          });
                        },
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _detallesController,
                        decoration: const InputDecoration(
                          labelText: 'Detalles',
                          prefixIcon: Icon(Icons.notes),
                          border: OutlineInputBorder(),
                        ),
                        maxLines: 2,
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<EstadoCita>(
                        value: _estado,
                        decoration: const InputDecoration(
                          labelText: 'Estado',
                          prefixIcon: Icon(Icons.flag),
                          border: OutlineInputBorder(),
                        ),
                        items: EstadoCita.values.map((estado) {
                          return DropdownMenuItem(
                            value: estado,
                            child: Row(
                              children: [
                                Container(
                                  width: 12,
                                  height: 12,
                                  decoration: BoxDecoration(
                                    color: _getEstadoColor(estado),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(_getEstadoTexto(estado)),
                              ],
                            ),
                          );
                        }).toList(),
                        onChanged: (value) {
                          if (value != null) {
                            setState(() => _estado = value);
                          }
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
            _buildFooter(),
          ],
        ),
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
          const Icon(Icons.edit, color: Colors.white, size: 28),
          const SizedBox(width: 12),
          const Text(
            'Editar Cita',
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

  Widget _buildFooter() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(20)),
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () => Navigator.pop(context),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: const Text('Cancelar'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton(
              onPressed: _guardarCambios,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0A4B84),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: const Text('Guardar'),
            ),
          ),
        ],
      ),
    );
  }

  void _seleccionarFecha() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _fechaSeleccionada,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(primary: Color(0xFF0A4B84)),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() => _fechaSeleccionada = picked);
    }
  }

  void _seleccionarHora() async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _horaSeleccionada,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(primary: Color(0xFF0A4B84)),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() => _horaSeleccionada = picked);
    }
  }

  void _guardarCambios() {
    if (_formKey.currentState!.validate()) {
      final fechaHora = DateTime(
        _fechaSeleccionada.year,
        _fechaSeleccionada.month,
        _fechaSeleccionada.day,
        _horaSeleccionada.hour,
        _horaSeleccionada.minute,
      );

      final citaActualizada = widget.cita.copyWith(
        nombreCompleto: _nombreController.text,
        telefono: _telefonoController.text,
        correo: _correoController.text,
        tipoDocumento: _tipoDocumento,
        numeroDocumento: _numeroDocumentoController.text,
        fechaHora: fechaHora,
        servicio: _servicioSeleccionado ?? '',
        detalles: _detallesController.text,
        estado: _estado,
      );

      Navigator.pop(context, citaActualizada);
    }
  }

  String _getTipoDocumentoTexto(TipoDocumento tipo) {
    switch (tipo) {
      case TipoDocumento.cedula:
        return 'Cédula';
      case TipoDocumento.pasaporte:
        return 'Pasaporte';
      case TipoDocumento.tarjetaIdentidad:
        return 'Tarjeta de Identidad';
      case TipoDocumento.registroCivil:
        return 'Registro Civil';
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

  Color _getEstadoColor(EstadoCita estado) {
    switch (estado) {
      case EstadoCita.solicitada:
        return const Color(0xFFFFA726);
      case EstadoCita.confirmada:
        return const Color(0xFF42A5F5);
      case EstadoCita.completada:
        return const Color(0xFF66BB6A);
      case EstadoCita.cancelada:
        return const Color(0xFFEF5350);
      case EstadoCita.reprogramada:
        return const Color(0xFF9C27B0);
    }
  }
}
