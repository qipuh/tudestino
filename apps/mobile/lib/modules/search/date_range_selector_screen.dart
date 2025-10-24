import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';

class DateRangeSelectorScreen extends StatefulWidget {
  final DateTime? initialCheckIn;
  final DateTime? initialCheckOut;

  const DateRangeSelectorScreen({
    super.key,
    this.initialCheckIn,
    this.initialCheckOut,
  });

  @override
  State<DateRangeSelectorScreen> createState() => _DateRangeSelectorScreenState();
}

class _DateRangeSelectorScreenState extends State<DateRangeSelectorScreen> {
  late DateTime _firstMonth;
  late DateTime _secondMonth;
  DateTime? _checkInDate;
  DateTime? _checkOutDate;
  DateTime? _rangeStart;
  DateTime? _rangeEnd;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _firstMonth = DateTime(now.year, now.month, 1);
    _secondMonth = DateTime(now.year, now.month + 1, 1);

    _checkInDate = widget.initialCheckIn;
    _checkOutDate = widget.initialCheckOut;
    _rangeStart = _checkInDate;
    _rangeEnd = _checkOutDate;
  }

  void _onDaySelected(DateTime selectedDay, DateTime focusedDay) {
    // No permitir seleccionar fechas pasadas (excepto hoy)
    if (!isSameDay(selectedDay, DateTime.now()) && selectedDay.isBefore(DateTime.now())) {
      return;
    }

    setState(() {
      if (_rangeStart == null || (_rangeStart != null && _rangeEnd != null)) {
        // Iniciar nueva selección
        _rangeStart = selectedDay;
        _rangeEnd = null;
        _checkInDate = selectedDay;
        _checkOutDate = null;
      } else if (_rangeStart != null && _rangeEnd == null) {
        // Completar rango
        if (selectedDay.isAfter(_rangeStart!)) {
          _rangeEnd = selectedDay;
          _checkOutDate = selectedDay;
        } else {
          // Si selecciona una fecha anterior, reiniciar
          _rangeStart = selectedDay;
          _rangeEnd = null;
          _checkInDate = selectedDay;
          _checkOutDate = null;
        }
      }
    });
  }

  int _getDaysDifference() {
    if (_checkInDate != null && _checkOutDate != null) {
      return _checkOutDate!.difference(_checkInDate!).inDays;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final nights = _getDaysDifference();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('¿Cuándo viajas?'),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          if (_checkInDate != null && _checkOutDate != null)
            TextButton(
              onPressed: () {
                Navigator.pop(context, {
                  'checkIn': _checkInDate,
                  'checkOut': _checkOutDate,
                });
              },
              child: Text(
                'Continuar',
                style: TextStyle(
                  color: theme.primaryColor,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          // Info Card con fechas seleccionadas
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  theme.primaryColor.withAlpha(25),
                  theme.primaryColor.withAlpha(10),
                ],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: theme.primaryColor.withAlpha(50),
                width: 1,
              ),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: _buildDateInfo(
                        'Entrada',
                        _checkInDate,
                        Icons.login,
                        theme,
                      ),
                    ),
                    Container(
                      height: 50,
                      width: 2,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            theme.primaryColor.withAlpha(100),
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                    Expanded(
                      child: _buildDateInfo(
                        'Salida',
                        _checkOutDate,
                        Icons.logout,
                        theme,
                      ),
                    ),
                  ],
                ),
                if (nights > 0) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: theme.primaryColor,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '$nights ${nights == 1 ? "noche" : "noches"}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Calendarios
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              children: [
                // Primer mes
                _buildCalendar(
                  _firstMonth,
                  theme,
                ),
                const SizedBox(height: 24),

                // Segundo mes
                _buildCalendar(
                  _secondMonth,
                  theme,
                ),
                const SizedBox(height: 80),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _checkInDate != null && _checkOutDate != null
          ? Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(25),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: SafeArea(
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context, {
                      'checkIn': _checkInDate,
                      'checkOut': _checkOutDate,
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    'Confirmar ${nights > 0 ? "($nights ${nights == 1 ? "noche" : "noches"})" : ""}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            )
          : null,
    );
  }

  Widget _buildCalendar(DateTime month, ThemeData theme) {
    return TableCalendar(
      firstDay: DateTime.now(),
      lastDay: DateTime.now().add(const Duration(days: 365)),
      focusedDay: month,
      calendarFormat: CalendarFormat.month,
      availableCalendarFormats: const {CalendarFormat.month: 'Mes'},
      selectedDayPredicate: (day) {
        return isSameDay(_checkInDate, day) || isSameDay(_checkOutDate, day);
      },
      rangeStartDay: _rangeStart,
      rangeEndDay: _rangeEnd,
      onDaySelected: _onDaySelected,
      // Deshabilitar cambio de mes - mostrar solo los 2 meses fijos
      onPageChanged: (_) {},
      calendarStyle: CalendarStyle(
        outsideDaysVisible: false,
        todayDecoration: BoxDecoration(
          color: theme.primaryColor.withAlpha(50),
          shape: BoxShape.circle,
        ),
        todayTextStyle: TextStyle(
          color: theme.primaryColor,
          fontWeight: FontWeight.bold,
        ),
        selectedDecoration: BoxDecoration(
          color: theme.primaryColor,
          shape: BoxShape.circle,
        ),
        selectedTextStyle: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
        rangeStartDecoration: BoxDecoration(
          color: theme.primaryColor,
          shape: BoxShape.circle,
        ),
        rangeEndDecoration: BoxDecoration(
          color: theme.primaryColor,
          shape: BoxShape.circle,
        ),
        rangeHighlightColor: theme.primaryColor.withAlpha(25),
        withinRangeDecoration: BoxDecoration(
          color: theme.primaryColor.withAlpha(25),
          shape: BoxShape.circle,
        ),
        disabledDecoration: const BoxDecoration(
          shape: BoxShape.circle,
        ),
        disabledTextStyle: TextStyle(
          color: Colors.grey.shade300,
        ),
      ),
      headerStyle: const HeaderStyle(
        formatButtonVisible: false,
        titleCentered: true,
        titleTextStyle: TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.bold,
        ),
        leftChevronVisible: false,
        rightChevronVisible: false,
      ),
      daysOfWeekStyle: DaysOfWeekStyle(
        weekdayStyle: TextStyle(
          color: Colors.grey.shade700,
          fontWeight: FontWeight.w600,
        ),
        weekendStyle: TextStyle(
          color: Colors.grey.shade700,
          fontWeight: FontWeight.w600,
        ),
      ),
      enabledDayPredicate: (day) {
        // No permitir fechas pasadas
        return !day.isBefore(DateTime.now());
      },
      locale: 'es_ES',
    );
  }

  Widget _buildDateInfo(String label, DateTime? date, IconData icon, ThemeData theme) {
    final dateFormat = DateFormat('d MMM yyyy', 'es_ES');

    return Column(
      children: [
        Icon(
          icon,
          color: theme.primaryColor,
          size: 28,
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          date != null ? dateFormat.format(date) : 'Seleccionar',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            color: date != null ? Colors.black87 : Colors.grey.shade400,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
