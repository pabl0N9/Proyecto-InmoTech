import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../models/cita_model.dart';
import '../../../services/citas_service.dart';
import 'animaciones_feedback.dart';

class CrearCitaDialog extends StatefulWidget {
  const CrearCitaDialog({super.key});

  @override
  State<CrearCitaDialog> createState() => _CrearCitaDialogState();
}

class _CrearCitaDialogState extends State<CrearCitaDialog> {
  final _formKey = GlobalKey<FormState>();

  // Fecha y hora
  DateTime? _fechaSeleccionada;
  TimeOfDay? _horaSeleccionada;

  // Servicio y detalles
  final _detallesController = TextEditingController();
  String? _servicioSeleccionado;

  // Lista de servicios disponibles (iguales a la web)
  final List<Map<String, String>> _servicios = [
    {'value': 'Visita a Propiedad', 'label': 'Visita a Propiedad'},
    {'value': 'Avalúos', 'label': 'Avalúos'},
    {'value': 'Gestión de Alquileres', 'label': 'Gestión de Alquileres'},
    {'value': 'Asesoría Legal', 'label': 'Asesoría Legal'},
  ];

  // Horarios disponibles dinámicamente cargados
  List<TimeOfDay> _horariosDisponibles = [];
  bool _cargandoHorarios = false;

  @override
  void initState() {
    super.initState();
    // Los horarios se cargarán cuando se seleccione una fecha
  }

  @override
  void dispose() {
    _detallesController.dispose();
    super.dispose();
  }

  // Cargar horarios disponibles para una fecha específica
  Future<void> _cargarHorariosDisponibles(DateTime fecha) async {
    if (_cargandoHorarios) return;

    setState(() => _cargandoHorarios = true);

    try {
      final service = CitasService();
      final horarios = await service.obtenerHorariosDisponibles(fecha);
      setState(() {
        _horariosDisponibles = horarios;
        _cargandoHorarios = false;
      });
    } catch (e) {
      print('Error al cargar horarios: $e');
      // En caso de error, mostrar todos los horarios disponibles
      final todosHorarios = <TimeOfDay>[];
      for (int hora = 8; hora <= 17; hora++) {
        todosHorarios.add(TimeOfDay(hour: hora, minute: 0));
        todosHorarios.add(TimeOfDay(hour: hora, minute: 30));
      }
      setState(() {
        _horariosDisponibles = todosHorarios;
        _cargandoHorarios = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return FeedbackAnimations.bottomSheetEntranceAnimation(
      child: Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.9,
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
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildFechaSelector().withStaggeredAnimation(0),
                      const SizedBox(height: 20),
                      _buildHoraSelector().withStaggeredAnimation(1),
                      const SizedBox(height: 20),
                      _buildServicioSelector().withStaggeredAnimation(2),
                      const SizedBox(height: 20),
                      _buildDetallesField().withStaggeredAnimation(3),
                      const SizedBox(height: 30),
                      _buildActionButtons().withStaggeredAnimation(4),
                      const SizedBox(height: 20), // Extra padding for bottom
                    ],
                  ),
                ),
              ),
            ),
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
          const Icon(Icons.add_circle_outline, color: Colors.white, size: 28),
          const SizedBox(width: 12),
          const Text(
            'Nueva Cita',
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

  Widget _buildFechaSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Fecha de la Cita',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF0A4B84),
          ),
        ),
        const SizedBox(height: 8),
        InkWell(
          onTap: _seleccionarFecha,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(
                color: _fechaSeleccionada != null
                    ? const Color(0xFF0A4B84)
                    : Colors.grey.shade300,
                width: 1.5,
              ),
              borderRadius: BorderRadius.circular(12),
              color: _fechaSeleccionada != null
                  ? const Color(0xFF0A4B84).withOpacity(0.05)
                  : Colors.grey.shade50,
            ),
            child: Row(
              children: [
                Icon(
                  Icons.calendar_today,
                  color: _fechaSeleccionada != null
                      ? const Color(0xFF0A4B84)
                      : Colors.grey.shade400,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _fechaSeleccionada != null
                        ? DateFormat('EEEE, dd \'de\' MMMM \'de\' yyyy', 'es').format(_fechaSeleccionada!)
                        : 'Selecciona una fecha',
                    style: TextStyle(
                      color: _fechaSeleccionada != null ? Colors.black87 : Colors.grey.shade500,
                      fontSize: 16,
                    ),
                  ),
                ),
                Icon(
                  Icons.arrow_drop_down,
                  color: _fechaSeleccionada != null
                      ? const Color(0xFF0A4B84)
                      : Colors.grey.shade400,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHoraSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Hora de la Cita',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF0A4B84),
          ),
        ),
        const SizedBox(height: 8),
        InkWell(
          onTap: _seleccionarHora,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(
                color: _horaSeleccionada != null
                    ? const Color(0xFF0A4B84)
                    : Colors.grey.shade300,
                width: 1.5,
              ),
              borderRadius: BorderRadius.circular(12),
              color: _horaSeleccionada != null
                  ? const Color(0xFF0A4B84).withOpacity(0.05)
                  : Colors.grey.shade50,
            ),
            child: Row(
              children: [
                Icon(
                  Icons.access_time,
                  color: _horaSeleccionada != null
                      ? const Color(0xFF0A4B84)
                      : Colors.grey.shade400,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _horaSeleccionada != null
                        ? _horaSeleccionada!.format(context)
                        : 'Selecciona una hora',
                    style: TextStyle(
                      color: _horaSeleccionada != null ? Colors.black87 : Colors.grey.shade500,
                      fontSize: 16,
                    ),
                  ),
                ),
                Icon(
                  Icons.arrow_drop_down,
                  color: _horaSeleccionada != null
                      ? const Color(0xFF0A4B84)
                      : Colors.grey.shade400,
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Horarios disponibles: 8:00 AM - 6:00 PM (cada 30 minutos)',
          style: TextStyle(
            color: Colors.grey,
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildServicioSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Servicio Requerido',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF0A4B84),
          ),
        ),
        const SizedBox(height: 8),
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
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF0A4B84), width: 2),
            ),
          ),
          hint: const Text('Selecciona un servicio'),
          items: _servicios.map((servicio) {
            return DropdownMenuItem<String>(
              value: servicio['value'],
              child: Text(servicio['label']!),
            );
          }).toList(),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Por favor selecciona un servicio';
            }
            return null;
          },
          onChanged: (value) {
            setState(() {
              _servicioSeleccionado = value;
            });
          },
        ),
      ],
    );
  }

  Widget _buildDetallesField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Detalles Adicionales (Opcional)',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF0A4B84),
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _detallesController,
          maxLines: 3,
          decoration: InputDecoration(
            hintText: 'Describe brevemente qué necesitas...',
            contentPadding: const EdgeInsets.all(16),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.grey, width: 1.5),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade300, width: 1.5),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF0A4B84), width: 2),
            ),
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
            onPressed: () => Navigator.pop(context),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              side: const BorderSide(color: Colors.grey),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              'Cancelar',
              style: TextStyle(color: Colors.grey, fontSize: 16),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: ElevatedButton(
            onPressed: _crearCita,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0A4B84),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              'Agendar Cita',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
            ),
          ),
        ),
      ],
    );
  }

  void _seleccionarFecha() async {
    final DateTime? picked = await showDialog<DateTime>(
      context: context,
      builder: (context) => _DatePickerDialog(
        initialDate: _fechaSeleccionada ?? DateTime.now(),
        firstDate: DateTime.now(),
        lastDate: DateTime.now().add(const Duration(days: 365)),
      ),
    );

    if (picked != null) {
      setState(() => _fechaSeleccionada = picked);
      // Cargar horarios disponibles para la fecha seleccionada
      await _cargarHorariosDisponibles(picked);
    }
  }

  void _seleccionarHora() async {
    final TimeOfDay? picked = await showDialog<TimeOfDay>(
      context: context,
      builder: (context) => _TimePickerDialog(
        initialTime: _horaSeleccionada,
        availableTimes: _horariosDisponibles,
      ),
    );

    if (picked != null) {
      setState(() => _horaSeleccionada = picked);
    }
  }

  void _crearCita() {
    print('🔄 Iniciando validación del formulario...');

    if (!_formKey.currentState!.validate()) {
      print('❌ Validación del formulario falló');
      return;
    }

    if (_fechaSeleccionada == null) {
      print('❌ Fecha no seleccionada');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor selecciona una fecha'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_horaSeleccionada == null) {
      print('❌ Hora no seleccionada');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor selecciona una hora'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_servicioSeleccionado == null || _servicioSeleccionado!.isEmpty) {
      print('❌ Servicio no seleccionado');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor selecciona un servicio'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final fechaHora = DateTime(
      _fechaSeleccionada!.year,
      _fechaSeleccionada!.month,
      _fechaSeleccionada!.day,
      _horaSeleccionada!.hour,
      _horaSeleccionada!.minute,
    );

    print('📅 Fecha y hora combinada: $fechaHora');

    // Validar que la fecha no sea anterior a hoy
    final ahora = DateTime.now();
    final hoy = DateTime(ahora.year, ahora.month, ahora.day);
    final fechaSeleccionadaSinHora = DateTime(_fechaSeleccionada!.year, _fechaSeleccionada!.month, _fechaSeleccionada!.day);

    if (fechaSeleccionadaSinHora.isBefore(hoy)) {
      print('❌ Fecha anterior no permitida');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No puedes agendar citas en fechas anteriores'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // Validar que la hora esté en el rango permitido
    if (!_horariosDisponibles.contains(_horaSeleccionada)) {
      print('❌ Hora no disponible');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('La hora seleccionada no está disponible'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final citaData = {
      'fechaHora': fechaHora,
      'servicio': _servicioSeleccionado!,
      'detalles': _detallesController.text,
    };

    print('✅ Datos de cita preparados: $citaData');

    // Mostrar mensaje de éxito simple
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Procesando cita...'),
        backgroundColor: Colors.blue,
        duration: Duration(seconds: 1),
      ),
    );

    // Cerrar el diálogo y retornar los datos
    print('🚀 Cerrando diálogo y retornando datos...');
    Navigator.pop(context, citaData);
  }


}

// Diálogo personalizado para seleccionar hora con botones específicos
class _TimePickerDialog extends StatefulWidget {
  final TimeOfDay? initialTime;
  final List<TimeOfDay> availableTimes;

  const _TimePickerDialog({
    this.initialTime,
    required this.availableTimes,
  });

  @override
  State<_TimePickerDialog> createState() => _TimePickerDialogState();
}

class _TimePickerDialogState extends State<_TimePickerDialog> {
  TimeOfDay? _selectedTime;

  @override
  void initState() {
    super.initState();
    _selectedTime = widget.initialTime;
  }

  @override
  Widget build(BuildContext context) {
    return FeedbackAnimations.dialogEntranceAnimation(
      child: Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.7,
            maxWidth: MediaQuery.of(context).size.width * 0.9,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: Color(0xFF0A4B84),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.access_time, color: Colors.white, size: 28),
                    const SizedBox(width: 12),
                    const Text(
                      'Seleccionar Hora',
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
              ),

              // Content
              Flexible(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Horarios Disponibles',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF0A4B84),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Selecciona la hora que prefieras para tu cita:',
                        style: TextStyle(
                          color: Colors.grey,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 20),
                      _buildTimeGrid(),
                      const SizedBox(height: 20),
                      if (_selectedTime != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0A4B84).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: const Color(0xFF0A4B84).withOpacity(0.3),
                            ),
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.check_circle,
                                color: Color(0xFF0A4B84),
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Hora seleccionada: ${_selectedTime!.format(context)}',
                                style: const TextStyle(
                                  color: Color(0xFF0A4B84),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                      ],
                      _buildActionButtons(),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTimeGrid() {
    // Agrupar horas por período (mañana, tarde)
    final morningTimes = widget.availableTimes.where((time) => time.hour < 12).toList();
    final afternoonTimes = widget.availableTimes.where((time) => time.hour >= 12).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (morningTimes.isNotEmpty) ...[
          _buildTimeSection('Mañana', morningTimes),
          const SizedBox(height: 20),
        ],
        if (afternoonTimes.isNotEmpty) ...[
          _buildTimeSection('Tarde', afternoonTimes),
        ],
      ],
    );
  }

  Widget _buildTimeSection(String title, List<TimeOfDay> times) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: times.map((time) => _buildTimeButton(time)).toList(),
        ),
      ],
    );
  }

  Widget _buildTimeButton(TimeOfDay time) {
    final isSelected = _selectedTime != null &&
                      _selectedTime!.hour == time.hour &&
                      _selectedTime!.minute == time.minute;

    return GestureDetector(
      onTap: () {
        setState(() => _selectedTime = time);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0A4B84) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF0A4B84) : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF0A4B84).withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          time.format(context),
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.black87,
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildActionButtons() {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: () => Navigator.pop(context),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              side: const BorderSide(color: Colors.grey),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              'Cancelar',
              style: TextStyle(color: Colors.grey, fontSize: 16),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: ElevatedButton(
            onPressed: _selectedTime != null
                ? () => Navigator.pop(context, _selectedTime)
                : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: _selectedTime != null
                  ? const Color(0xFF0A4B84)
                  : Colors.grey.shade400,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              'Seleccionar',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
            ),
          ),
        ),
      ],
    );
  }
}

// Diálogo personalizado para seleccionar fecha con calendario en español
class _DatePickerDialog extends StatefulWidget {
  final DateTime initialDate;
  final DateTime firstDate;
  final DateTime lastDate;

  const _DatePickerDialog({
    required this.initialDate,
    required this.firstDate,
    required this.lastDate,
  });

  @override
  State<_DatePickerDialog> createState() => _DatePickerDialogState();
}

class _DatePickerDialogState extends State<_DatePickerDialog> {
  late DateTime _selectedDate;
  late DateTime _currentMonth;
  late PageController _pageController;

  final List<String> _meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  final List<String> _diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  @override
  void initState() {
    super.initState();
    _selectedDate = widget.initialDate;
    _currentMonth = DateTime(_selectedDate.year, _selectedDate.month);
    _pageController = PageController(initialPage: _getMonthIndex(_currentMonth));
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  int _getMonthIndex(DateTime date) {
    return (date.year - widget.firstDate.year) * 12 + date.month - widget.firstDate.month;
  }

  @override
  Widget build(BuildContext context) {
    return FeedbackAnimations.dialogEntranceAnimation(
      child: Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.8,
            maxWidth: MediaQuery.of(context).size.width * 0.95,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: Color(0xFF0A4B84),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today, color: Colors.white, size: 28),
                    const SizedBox(width: 12),
                    const Text(
                      'Seleccionar Fecha',
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
              ),

              // Calendar Content
              Flexible(
                child: Column(
                  children: [
                    _buildMonthNavigation(),
                    _buildDaysOfWeek(),
                    Expanded(
                      child: PageView.builder(
                        controller: _pageController,
                        onPageChanged: (index) {
                          setState(() {
                            _currentMonth = DateTime(
                              widget.firstDate.year + (index ~/ 12),
                              widget.firstDate.month + (index % 12),
                            );
                          });
                        },
                        itemBuilder: (context, index) {
                          final month = DateTime(
                            widget.firstDate.year + (index ~/ 12),
                            widget.firstDate.month + (index % 12),
                          );
                          return _buildCalendarGrid(month);
                        },
                      ),
                    ),
                    _buildActionButtons(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMonthNavigation() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left, color: Color(0xFF0A4B84)),
            onPressed: _previousMonth,
          ),
          Text(
            '${_meses[_currentMonth.month - 1]} ${_currentMonth.year}',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Color(0xFF0A4B84),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right, color: Color(0xFF0A4B84)),
            onPressed: _nextMonth,
          ),
        ],
      ),
    );
  }

  Widget _buildDaysOfWeek() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: _diasSemana.map((dia) => Container(
          width: 32,
          height: 32,
          alignment: Alignment.center,
          child: Text(
            dia,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.grey,
            ),
          ),
        )).toList(),
      ),
    );
  }

  Widget _buildCalendarGrid(DateTime month) {
    final firstDayOfMonth = DateTime(month.year, month.month, 1);
    final lastDayOfMonth = DateTime(month.year, month.month + 1, 0);
    final firstWeekday = firstDayOfMonth.weekday; // 1 = Monday, 7 = Sunday

    // Adjust for Monday start (1 = Monday, 7 = Sunday -> convert to 0-6 with Monday = 0)
    final adjustedFirstWeekday = (firstWeekday - 1) % 7;

    final daysInMonth = lastDayOfMonth.day;
    final totalCells = 42; // 6 weeks * 7 days

    return GridView.builder(
      padding: const EdgeInsets.all(20),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 7,
        childAspectRatio: 1,
      ),
      itemCount: totalCells,
      itemBuilder: (context, index) {
        final dayNumber = index - adjustedFirstWeekday + 1;
        final isCurrentMonth = dayNumber >= 1 && dayNumber <= daysInMonth;

        if (!isCurrentMonth) {
          return const SizedBox.shrink();
        }

        final date = DateTime(month.year, month.month, dayNumber);
        final isSelected = _isSameDate(date, _selectedDate);
        final isToday = _isSameDate(date, DateTime.now());
        final isDisabled = date.isBefore(widget.firstDate) || date.isAfter(widget.lastDate);

        return GestureDetector(
          onTap: isDisabled ? null : () => _selectDate(date),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            margin: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              color: isSelected
                  ? const Color(0xFF0A4B84)
                  : isToday
                      ? const Color(0xFF0A4B84).withOpacity(0.1)
                      : Colors.transparent,
              borderRadius: BorderRadius.circular(8),
              border: isToday && !isSelected
                  ? Border.all(color: const Color(0xFF0A4B84), width: 1)
                  : null,
            ),
            child: Center(
              child: Text(
                dayNumber.toString(),
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                  color: isSelected
                      ? Colors.white
                      : isDisabled
                          ? Colors.grey.shade400
                          : Colors.black87,
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildActionButtons() {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () => Navigator.pop(context),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                side: const BorderSide(color: Colors.grey),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Cancelar',
                style: TextStyle(color: Colors.grey, fontSize: 16),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context, _selectedDate),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0A4B84),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Seleccionar',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _previousMonth() {
    final newMonth = DateTime(_currentMonth.year, _currentMonth.month - 1);
    if (newMonth.isAfter(DateTime(widget.firstDate.year, widget.firstDate.month - 1))) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _nextMonth() {
    final newMonth = DateTime(_currentMonth.year, _currentMonth.month + 1);
    if (newMonth.isBefore(DateTime(widget.lastDate.year, widget.lastDate.month + 1))) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _selectDate(DateTime date) {
    setState(() => _selectedDate = date);
  }

  bool _isSameDate(DateTime date1, DateTime date2) {
    return date1.year == date2.year &&
           date1.month == date2.month &&
           date1.day == date2.day;
  }
}
