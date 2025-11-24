import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../models/cita_model.dart';

class CalendarioWidget extends StatelessWidget {
  final DateTime focusedDay;
  final DateTime? selectedDay;
  final Map<DateTime, List<Cita>> citasPorFecha;
  final Function(DateTime, DateTime) onDaySelected;
  final Function(DateTime) onPageChanged;
  final Function(Cita, DateTime) onCitaDraggedToNewDate;

  const CalendarioWidget({
    super.key,
    required this.focusedDay,
    required this.selectedDay,
    required this.citasPorFecha,
    required this.onDaySelected,
    required this.onPageChanged,
    required this.onCitaDraggedToNewDate,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TableCalendar(
        firstDay: DateTime.utc(2020, 1, 1),
        lastDay: DateTime.utc(2030, 12, 31),
        focusedDay: focusedDay,
        selectedDayPredicate: (day) => isSameDay(selectedDay, day),
        calendarFormat: CalendarFormat.month,
        startingDayOfWeek: StartingDayOfWeek.monday,
        headerStyle: const HeaderStyle(
          formatButtonVisible: false,
          titleCentered: true,
          titleTextStyle: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Color(0xFF0A4B84),
          ),
        ),
        calendarStyle: CalendarStyle(
          todayDecoration: BoxDecoration(
            color: const Color(0xFF0A4B84).withOpacity(0.3),
            shape: BoxShape.circle,
          ),
          selectedDecoration: const BoxDecoration(
            color: Color(0xFF0A4B84),
            shape: BoxShape.circle,
          ),
          markerDecoration: const BoxDecoration(
            color: Color(0xFFFFA726),
            shape: BoxShape.circle,
          ),
          markersMaxCount: 3,
        ),
        eventLoader: (day) {
          final normalizedDay = DateTime(day.year, day.month, day.day);
          return citasPorFecha[normalizedDay] ?? [];
        },
        onDaySelected: onDaySelected,
        onPageChanged: onPageChanged,
      ),
    );
  }
}
