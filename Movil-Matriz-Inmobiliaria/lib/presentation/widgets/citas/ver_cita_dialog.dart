import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../models/cita_model.dart';

class VerCitaDialog extends StatelessWidget {
  final Cita cita;

  const VerCitaDialog({super.key, required this.cita});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        constraints: const BoxConstraints(maxHeight: 600),
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSeccion('Información Personal', [
                      _buildInfoRow(Icons.person, 'Nombre', cita.nombreCompleto),
                      _buildInfoRow(Icons.phone, 'Teléfono', cita.telefono),
                      _buildInfoRow(Icons.email, 'Correo', cita.correo),
                      _buildInfoRow(Icons.badge, 'Documento',
                          '${cita.tipoDocumentoTexto}: ${cita.numeroDocumento}'),
                    ]),
                    const SizedBox(height: 20),
                    _buildSeccion('Fecha y Hora', [
                      _buildInfoRow(
                        Icons.calendar_today,
                        'Fecha',
                        DateFormat('dd/MM/yyyy').format(cita.fechaHora),
                      ),
                      _buildInfoRow(
                        Icons.access_time,
                        'Hora',
                        DateFormat('HH:mm').format(cita.fechaHora),
                      ),
                    ]),
                    const SizedBox(height: 20),
                    _buildSeccion('Servicio', [
                      _buildInfoRow(Icons.medical_services, 'Servicio', cita.servicio),
                      if (cita.detalles.isNotEmpty)
                        _buildInfoRow(Icons.notes, 'Detalles', cita.detalles),
                    ]),
                    const SizedBox(height: 20),
                    _buildSeccion('Estado', [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: cita.estadoColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: cita.estadoColor),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 16,
                              height: 16,
                              decoration: BoxDecoration(
                                color: cita.estadoColor,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              cita.estadoTexto,
                              style: TextStyle(
                                color: cita.estadoColor,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ]),
                    const SizedBox(height: 20),
                    _buildSeccion('Información Adicional', [
                      _buildInfoRow(
                        Icons.access_time_filled,
                        'Creada el',
                        DateFormat('dd/MM/yyyy HH:mm').format(cita.fechaCreacion),
                      ),
                      _buildInfoRow(Icons.fingerprint, 'ID', cita.id),
                    ]),
                  ],
                ),
              ),
            ),
            _buildFooter(context),
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
          const Icon(Icons.visibility, color: Colors.white, size: 28),
          const SizedBox(width: 12),
          const Text(
            'Detalles de la Cita',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSeccion(String titulo, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          titulo,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Color(0xFF0A4B84),
          ),
        ),
        const SizedBox(height: 12),
        ...children,
      ],
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Colors.black54),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.black54,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.black87,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(20)),
      ),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: () => Navigator.pop(context),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF0A4B84),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
          ),
          child: const Text('Cerrar'),
        ),
      ),
    );
  }
}
