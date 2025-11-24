import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/cita_model.dart';
import '../../services/citas_service.dart';
import '../../providers/theme_provider.dart';
import '../widgets/citas/estadisticas_cards.dart';
import '../widgets/citas/barra_busqueda_mejorada.dart';
import '../widgets/citas/filtros_avanzados_dialog.dart';
import '../widgets/citas/animacion_reagendamiento.dart';
import '../widgets/citas/alertas_modernas.dart';
import '../widgets/citas/calendario_widget.dart';
import '../widgets/citas/lista_citas_dia.dart';
import '../widgets/citas/crear_cita_dialog.dart';
import '../widgets/citas/editar_cita_dialog.dart';
import '../widgets/citas/ver_cita_dialog.dart';
import '../widgets/citas/lista_vista_widget.dart';
import '../widgets/citas/timeline_vista_widget.dart';

class CitasPage extends StatefulWidget {
  const CitasPage({super.key});

  @override
  State<CitasPage> createState() => _CitasPageState();
}

class _CitasPageState extends State<CitasPage> {
  final CitasService _citasService = CitasService();
  final TextEditingController _busquedaController = TextEditingController();

  List<Cita> _todasLasCitas = [];
  List<Cita> _citasFiltradas = [];
  Map<DateTime, List<Cita>> _citasPorFecha = {};
  Map<EstadoCita, int> _estadisticas = {};

  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  EstadoCita? _estadoFiltro;
  DateTime? _fechaInicioFiltro;
  DateTime? _fechaFinFiltro;
  int _vistaSeleccionada = 0; // 0: Calendario, 1: Lista, 2: Timeline
  bool _fabExpanded = false;

  @override
  void initState() {
    super.initState();
    _selectedDay = _focusedDay;
    _cargarCitas();
  }

  @override
  void dispose() {
    _busquedaController.dispose();
    super.dispose();
  }

  Future<void> _cargarCitas() async {
    final citas = await _citasService.obtenerCitas();
    final estadisticas = await _citasService.obtenerEstadisticas();

    setState(() {
      _todasLasCitas = citas;
      _citasFiltradas = citas;
      _estadisticas = estadisticas;
      _actualizarCitasPorFecha();
    });
  }

  void _actualizarCitasPorFecha() {
    _citasPorFecha.clear();
    for (var cita in _citasFiltradas) {
      final fecha = DateTime(cita.fechaHora.year, cita.fechaHora.month, cita.fechaHora.day);
      _citasPorFecha.putIfAbsent(fecha, () => []).add(cita);
    }
  }

  void _aplicarFiltros() {
    List<Cita> resultado = List.from(_todasLasCitas);

    // Filtro por búsqueda
    if (_busquedaController.text.isNotEmpty) {
      final query = _busquedaController.text.toLowerCase();
      resultado = resultado.where((c) {
        return c.nombreCompleto.toLowerCase().contains(query) ||
               c.telefono.contains(query) ||
               c.correo.toLowerCase().contains(query) ||
               c.numeroDocumento.contains(query) ||
               c.servicio.toLowerCase().contains(query);
      }).toList();
    }

    // Filtro por estado
    if (_estadoFiltro != null) {
      resultado = resultado.where((c) => c.estado == _estadoFiltro).toList();
    }

    // Filtro por rango de fechas
    if (_fechaInicioFiltro != null && _fechaFinFiltro != null) {
      resultado = resultado.where((c) {
        return c.fechaHora.isAfter(_fechaInicioFiltro!) &&
               c.fechaHora.isBefore(_fechaFinFiltro!.add(const Duration(days: 1)));
      }).toList();
    }

    setState(() {
      _citasFiltradas = resultado;
      _actualizarCitasPorFecha();
    });
  }

  List<Cita> _obtenerCitasDelDia(DateTime dia) {
    final fecha = DateTime(dia.year, dia.month, dia.day);
    return _citasPorFecha[fecha] ?? [];
  }

  @override
  Widget build(BuildContext context) {
    final citasDelDiaSeleccionado = _obtenerCitasDelDia(_selectedDay ?? _focusedDay);

    return DragTarget<Cita>(
      onWillAccept: (data) => true,
      onAccept: (cita) {
        // Cuando se suelta una cita en el área general, no hacemos nada
      },
      builder: (context, candidateData, rejectedData) {
        // Dynamic background gradient based on time of day
        final hour = DateTime.now().hour;
        final isMorning = hour >= 6 && hour < 12;
        final isAfternoon = hour >= 12 && hour < 18;

        return Scaffold(
          body: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: isMorning
                    ? [const Color(0xFFE3F2FD), const Color(0xFFF5F5F5)] // Light blue morning
                    : isAfternoon
                        ? [const Color(0xFFFFF8E1), const Color(0xFFF5F5F5)] // Light yellow afternoon
                        : [const Color(0xFFE8EAF6), const Color(0xFFF5F5F5)], // Light purple evening
              ),
            ),
            child: Column(
            children: [
              // Estadísticas
              Padding(
                padding: const EdgeInsets.only(top: 24.0),
                child: EstadisticasCards(
                  estadisticas: _estadisticas,
                  total: _todasLasCitas.length,
                  onEstadoTap: (estado) {
                    setState(() {
                      _estadoFiltro = estado;
                      _aplicarFiltros();
                    });
                  },
                ),
              ),

              // Barra de búsqueda mejorada
              BarraBusquedaMejorada(
                controller: _busquedaController,
                onChanged: (value) {
                  setState(() {
                    _aplicarFiltros();
                  });
                },
                onSubmitted: (value) {
                  setState(() {
                    _aplicarFiltros();
                  });
                },
                onClear: () {
                  _busquedaController.clear();
                  setState(() {
                    _aplicarFiltros();
                  });
                },
                suggestions: _obtenerSugerenciasBusqueda(),
              ),

              // Botón cambiar vista
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    Expanded(
                      child: SegmentedButton<int>(
                        segments: const [
                          ButtonSegment(
                            value: 0,
                            label: Text('Calendario'),
                            icon: Icon(Icons.calendar_month),
                          ),
                          ButtonSegment(
                            value: 1,
                            label: Text('Lista'),
                            icon: Icon(Icons.list),
                          ),
                          ButtonSegment(
                            value: 2,
                            label: Text('Timeline'),
                            icon: Icon(Icons.timeline),
                          ),
                        ],
                        selected: {_vistaSeleccionada},
                        onSelectionChanged: (Set<int> newSelection) {
                          setState(() {
                            _vistaSeleccionada = newSelection.first;
                          });
                        },
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 8),

              // Contenido principal
              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  transitionBuilder: (Widget child, Animation<double> animation) {
                    return FadeTransition(
                      opacity: animation,
                      child: SlideTransition(
                        position: Tween<Offset>(
                          begin: const Offset(0.1, 0.0),
                          end: Offset.zero,
                        ).animate(CurvedAnimation(
                          parent: animation,
                          curve: Curves.easeOut,
                        )),
                        child: child,
                      ),
                    );
                  },
                  child: _buildVistaSeleccionada(citasDelDiaSeleccionado),
                ),
              ),
            ],
            ),
          ),
          floatingActionButton: Stack(
            children: [
              if (_fabExpanded) ...[
                Positioned(
                  bottom: 100,
                  right: 16,
                  child: FloatingActionButton(
                    heroTag: 'filter',
                    onPressed: () {
                      _mostrarFiltrosAvanzados();
                      setState(() => _fabExpanded = false);
                    },
                    backgroundColor: Colors.blue,
                    child: const Icon(Icons.filter_alt, color: Colors.white),
                    tooltip: 'Filtros avanzados',
                  ),
                ),
                Positioned(
                  bottom: 160,
                  right: 16,
                  child: FloatingActionButton(
                    heroTag: 'clear',
                    onPressed: () {
                      setState(() {
                        _estadoFiltro = null;
                        _fechaInicioFiltro = null;
                        _fechaFinFiltro = null;
                        _busquedaController.clear();
                        _aplicarFiltros();
                        _fabExpanded = false;
                      });
                    },
                    backgroundColor: Colors.orange,
                    child: const Icon(Icons.clear_all, color: Colors.white),
                    tooltip: 'Limpiar filtros',
                  ),
                ),
                Positioned(
                  bottom: 220,
                  right: 16,
                  child: FloatingActionButton(
                    heroTag: 'calendar',
                    onPressed: () {
                      setState(() {
                        _vistaSeleccionada = (_vistaSeleccionada + 1) % 3;
                        _fabExpanded = false;
                      });
                    },
                    backgroundColor: Colors.green,
                    child: Icon(
                      _vistaSeleccionada == 0 ? Icons.list : _vistaSeleccionada == 1 ? Icons.timeline : Icons.calendar_month,
                      color: Colors.white,
                    ),
                    tooltip: 'Cambiar vista',
                  ),
                ),
                Positioned(
                  bottom: 280,
                  right: 16,
                  child: Consumer<ThemeProvider>(
                    builder: (context, themeProvider, child) {
                      return FloatingActionButton(
                        heroTag: 'theme',
                        onPressed: () {
                          themeProvider.toggleTheme();
                          setState(() => _fabExpanded = false);
                        },
                        backgroundColor: Colors.purple,
                        child: Icon(
                          themeProvider.isDarkMode ? Icons.light_mode : Icons.dark_mode,
                          color: Colors.white,
                        ),
                        tooltip: 'Cambiar tema',
                      );
                    },
                  ),
                ),
              ],
              Positioned(
                bottom: 16,
                right: 16,
                child: GestureDetector(
                  onLongPress: () => setState(() => _fabExpanded = !_fabExpanded),
                  child: FloatingActionButton.extended(
                    onPressed: _fabExpanded
                        ? () => setState(() => _fabExpanded = false)
                        : _mostrarDialogoCrearCita,
                    backgroundColor: const Color(0xFF0A4B84),
                    icon: AnimatedRotation(
                      turns: _fabExpanded ? 0.125 : 0,
                      duration: const Duration(milliseconds: 200),
                      child: const Icon(Icons.add, color: Colors.white),
                    ),
                    label: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 200),
                      child: _fabExpanded
                          ? const Text('Cerrar', style: TextStyle(color: Colors.white))
                          : const Text('Nueva Cita', style: TextStyle(color: Colors.white)),
                    ),
                    extendedIconLabelSpacing: _fabExpanded ? 4 : null,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildVistaCalendario(List<Cita> citasDelDia) {
    return RefreshIndicator(
      onRefresh: _cargarCitas,
      color: const Color(0xFF0A4B84),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          children: [
            // Calendario con drag target
            DragTarget<Cita>(
              onWillAccept: (data) => true,
              onAccept: (cita) {
                // No hacemos nada aquí, el drag se maneja en los días individuales
              },
              builder: (context, candidateData, rejectedData) {
                return CalendarioWidget(
                  focusedDay: _focusedDay,
                  selectedDay: _selectedDay,
                  citasPorFecha: _citasPorFecha,
                  onDaySelected: (selectedDay, focusedDay) {
                    setState(() {
                      _selectedDay = selectedDay;
                      _focusedDay = focusedDay;
                    });
                  },
                  onPageChanged: (focusedDay) {
                    setState(() {
                      _focusedDay = focusedDay;
                    });
                  },
                  onCitaDraggedToNewDate: _reagendarCita,
                );
              },
            ),

            const SizedBox(height: 16),

            // Lista de citas del día con drag target
            DragTarget<Cita>(
              onWillAccept: (data) => true,
              onAccept: (cita) {
                if (_selectedDay != null) {
                  _reagendarCita(cita, _selectedDay!);
                }
              },
              builder: (context, candidateData, rejectedData) {
                return Container(
                  decoration: candidateData.isNotEmpty
                      ? BoxDecoration(
                          color: const Color(0xFF0A4B84).withOpacity(0.1),
                          border: Border.all(color: const Color(0xFF0A4B84), width: 2),
                          borderRadius: BorderRadius.circular(12),
                        )
                      : null,
                  child: ListaCitasDia(
                    citas: citasDelDia,
                    onCitaTap: _mostrarDialogoVerCita,
                    onEstadoChange: _cambiarEstadoCita,
                    onEdit: _mostrarDialogoEditarCita,
                    onDelete: _eliminarCita,
                    onDragToNewDate: _reagendarCita,
                  ),
                );
              },
            ),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildVistaLista() {
    return RefreshIndicator(
      onRefresh: _cargarCitas,
      color: const Color(0xFF0A4B84),
      child: ListaVistaWidget(
        citas: _citasFiltradas,
        onCitaTap: _mostrarDialogoVerCita,
        onEstadoChange: _cambiarEstadoCita,
        onEdit: _mostrarDialogoEditarCita,
        onDelete: _eliminarCita,
      ),
    );
  }

  Widget _buildVistaSeleccionada(List<Cita> citasDelDia) {
    switch (_vistaSeleccionada) {
      case 0:
        return _buildVistaCalendario(citasDelDia);
      case 1:
        return _buildVistaLista();
      case 2:
        return RefreshIndicator(
          onRefresh: _cargarCitas,
          color: const Color(0xFF0A4B84),
          child: TimelineVistaWidget(
            citas: _citasFiltradas,
            onCitaTap: _mostrarDialogoVerCita,
            onEstadoChange: _cambiarEstadoCita,
            onEdit: _mostrarDialogoEditarCita,
            onDelete: _eliminarCita,
          ),
        );
      default:
        return _buildVistaCalendario(citasDelDia);
    }
  }

  // CRUD Operations

  Future<void> _mostrarDialogoCrearCita() async {
    print('📱 Abriendo diálogo de crear cita...');

    final Map<String, dynamic>? citaData = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const CrearCitaDialog(),
    );

    print('📨 Datos retornados del diálogo: $citaData');

    if (citaData != null) {
      print('🔄 Llamando al servicio para crear cita...');

      try {
        final nuevaCita = await _citasService.crearCita(
          fechaHora: citaData['fechaHora'],
          servicio: citaData['servicio'],
          detalles: citaData['detalles'],
        );

        print('✅ Respuesta del servicio: $nuevaCita');

        if (nuevaCita != null && mounted) {
          print('🎉 Cita creada exitosamente');
          _mostrarMensaje('Cita creada exitosamente', Colors.green);
          _cargarCitas();
        } else if (mounted) {
          print('❌ Error: La cita retornada es null');
          _mostrarMensaje('Error al crear la cita', Colors.red);
        }
      } catch (e) {
        print('💥 Excepción al crear cita: $e');
        if (mounted) {
          _mostrarMensaje('Error al crear la cita: $e', Colors.red);
        }
      }
    } else {
      print('❌ Diálogo cancelado o sin datos');
    }
  }

  Future<void> _mostrarDialogoEditarCita(Cita cita) async {
    final bool? confirmar = await _mostrarDialogoConfirmacion(
      '¿Editar cita?',
      '¿Estás seguro de que deseas editar esta cita?',
    );

    if (confirmar != true) return;

    if (!mounted) return;

    final Cita? citaEditada = await showGeneralDialog<Cita>(
      context: context,
      barrierDismissible: true,
      barrierLabel: '',
      transitionDuration: const Duration(milliseconds: 300),
      pageBuilder: (context, animation, secondaryAnimation) => EditarCitaDialog(cita: cita),
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        return ScaleTransition(
          scale: Tween<double>(begin: 0.8, end: 1.0).animate(CurvedAnimation(parent: animation, curve: Curves.easeOut)),
          child: FadeTransition(
            opacity: animation,
            child: child,
          ),
        );
      },
    );

    if (citaEditada != null) {
      final exito = await _citasService.actualizarCita(citaEditada);
      if (exito && mounted) {
        _mostrarMensaje('Cita actualizada exitosamente', Colors.green);
        _cargarCitas();
      } else if (mounted) {
        _mostrarMensaje('Error al actualizar la cita', Colors.red);
      }
    }
  }

  Future<void> _mostrarDialogoVerCita(Cita cita) async {
    await showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: '',
      transitionDuration: const Duration(milliseconds: 300),
      pageBuilder: (context, animation, secondaryAnimation) => VerCitaDialog(cita: cita),
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        return ScaleTransition(
          scale: Tween<double>(begin: 0.8, end: 1.0).animate(CurvedAnimation(parent: animation, curve: Curves.easeOut)),
          child: FadeTransition(
            opacity: animation,
            child: child,
          ),
        );
      },
    );
  }

  Future<void> _eliminarCita(Cita cita) async {
    final bool? confirmar = await _mostrarDialogoConfirmacion(
      '¿Eliminar cita?',
      '¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.',
    );

    if (confirmar != true) return;

    final exito = await _citasService.eliminarCita(cita.id);
    if (exito && mounted) {
      _mostrarMensaje('Cita eliminada exitosamente', Colors.green);
      _cargarCitas();
    } else if (mounted) {
      _mostrarMensaje('Error al eliminar la cita', Colors.red);
    }
  }

  Future<void> _cambiarEstadoCita(Cita cita) async {
    final EstadoCita? nuevoEstado = await showModalBottomSheet<EstadoCita>(
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
              'Cambiar Estado',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ...EstadoCita.values.map((estado) {
              return ListTile(
                leading: Container(
                  width: 16,
                  height: 16,
                  decoration: BoxDecoration(
                    color: cita.copyWith(estado: estado).estadoColor,
                    shape: BoxShape.circle,
                  ),
                ),
                title: Text(cita.copyWith(estado: estado).estadoTexto),
                onTap: () => Navigator.pop(context, estado),
              );
            }).toList(),
          ],
        ),
      ),
    );

    if (nuevoEstado == null || nuevoEstado == cita.estado) return;

    final bool? confirmar = await _mostrarDialogoConfirmacion(
      '¿Cambiar estado?',
      '¿Estás seguro de que deseas cambiar el estado de esta cita?',
    );

    if (confirmar != true) return;

    final citaActualizada = cita.copyWith(estado: nuevoEstado);
    final exito = await _citasService.actualizarCita(citaActualizada);

    if (exito && mounted) {
      _mostrarMensaje('Estado actualizado exitosamente', Colors.green);
      _cargarCitas();
    } else if (mounted) {
      _mostrarMensaje('Error al actualizar el estado', Colors.red);
    }
  }

  Future<void> _reagendarCita(Cita cita, DateTime nuevaFecha) async {
    final bool? confirmar = await _mostrarDialogoConfirmacion(
      '¿Reagendar cita?',
      '¿Deseas mover esta cita a la nueva fecha?',
    );

    if (confirmar != true) return;

    final nuevaFechaHora = DateTime(
      nuevaFecha.year,
      nuevaFecha.month,
      nuevaFecha.day,
      cita.fechaHora.hour,
      cita.fechaHora.minute,
    );

    final citaActualizada = cita.copyWith(fechaHora: nuevaFechaHora);
    final exito = await _citasService.actualizarCita(citaActualizada);

    if (exito && mounted) {
      // Mostrar animación de reagendamiento
      ReagendamientoAnimationHelper.showReagendamientoAnimation(
        context,
        cita,
        cita.fechaHora,
        nuevaFechaHora,
        () {
          _cargarCitas();
          setState(() {
            _selectedDay = nuevaFecha;
          });
        },
      );
    } else if (mounted) {
      _mostrarMensaje('Error al reagendar la cita', Colors.red);
    }
  }

  // Helpers

  Future<bool?> _mostrarDialogoConfirmacion(String titulo, String mensaje) {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(titulo),
        content: Text(mensaje),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0A4B84),
              foregroundColor: Colors.white,
            ),
            child: const Text('Confirmar'),
          ),
        ],
      ),
    );
  }

  void _mostrarMensaje(String mensaje, Color color) {
    AlertType tipo;
    if (color == Colors.green) {
      tipo = AlertType.success;
    } else if (color == Colors.red) {
      tipo = AlertType.error;
    } else if (color == Colors.orange) {
      tipo = AlertType.warning;
    } else {
      tipo = AlertType.info;
    }

    context.showModernToast(
      message: mensaje,
      type: tipo,
    );
  }

  List<String> _obtenerSugerenciasBusqueda() {
    final Set<String> sugerencias = {};

    for (var cita in _todasLasCitas) {
      sugerencias.add(cita.nombreCompleto);
      sugerencias.add(cita.servicio);
      sugerencias.add(cita.telefono);
      sugerencias.add(cita.numeroDocumento);
    }

    return sugerencias.take(10).toList();
  }

  void _mostrarFiltrosAvanzados() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => FiltrosAvanzadosDialog(
        estadoSeleccionado: _estadoFiltro,
        fechaInicio: _fechaInicioFiltro,
        fechaFin: _fechaFinFiltro,
        onFiltrosAplicados: (estado, fechaInicio, fechaFin, servicio, soloUrgentes, precioMin, precioMax) {
          setState(() {
            _estadoFiltro = estado;
            _fechaInicioFiltro = fechaInicio;
            _fechaFinFiltro = fechaFin;
            // Aquí podrías agregar más filtros avanzados si los implementas
            _aplicarFiltros();
          });
        },
      ),
    );
  }
}
