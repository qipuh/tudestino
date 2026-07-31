import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../providers/reservations_provider.dart';

class CreateReservationScreen extends StatefulWidget {
  final String businessId;
  final String? businessName;
  final String? businessType;
  final List<String>? serviceIds;

  const CreateReservationScreen({
    super.key,
    required this.businessId,
    this.businessName,
    this.businessType,
    this.serviceIds,
  });

  @override
  State<CreateReservationScreen> createState() =>
      _CreateReservationScreenState();
}

class _CreateReservationScreenState extends State<CreateReservationScreen> {
  late DateTime _selectedDate;
  late TimeOfDay _selectedTime;
  late int _numberOfPeople = 1;
  String? _selectedServiceId;
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _selectedDate = DateTime.now().add(const Duration(days: 1));
    _selectedTime = TimeOfDay.now();
  }

  @override
  Widget build(BuildContext context) {
    final isSmartphone = widget.businessType == 'restaurant' ||
        widget.businessType == 'bar' ||
        widget.businessType == 'cafe';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nueva Reserva'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (widget.businessName != null)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Negocio',
                    style: Theme.of(context).textTheme.labelMedium,
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blue.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          _getBusinessIcon(widget.businessType),
                          color: Colors.blue,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.businessName!,
                                style: Theme.of(context)
                                    .textTheme
                                    .titleSmall
                                    ?.copyWith(fontWeight: FontWeight.bold),
                              ),
                              if (widget.businessType != null)
                                Text(
                                  widget.businessType!.toUpperCase(),
                                  style:
                                      Theme.of(context).textTheme.labelSmall,
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            // Fecha
            Text(
              'Fecha',
              style: Theme.of(context).textTheme.labelMedium,
            ),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () => _selectDate(context),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey[300]!),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(Icons.calendar_today, color: Colors.grey[600]),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        DateFormat('dd MMMM yyyy', 'es_ES')
                            .format(_selectedDate),
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ),
                    Icon(Icons.arrow_forward_ios,
                        size: 16, color: Colors.grey[600]),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Hora (si no es restaurante simple)
            if (!isSmartphone) ...[
              Text(
                'Hora',
                style: Theme.of(context).textTheme.labelMedium,
              ),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: () => _selectTime(context),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey[300]!),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.access_time, color: Colors.grey[600]),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _selectedTime.format(context),
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ),
                      Icon(Icons.arrow_forward_ios,
                          size: 16, color: Colors.grey[600]),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
            // Número de personas
            Text(
              'Número de Personas',
              style: Theme.of(context).textTheme.labelMedium,
            ),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey[300]!),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  IconButton(
                    onPressed: _numberOfPeople > 1
                        ? () => setState(() => _numberOfPeople--)
                        : null,
                    icon: const Icon(Icons.remove),
                  ),
                  Expanded(
                    child: Text(
                      '$_numberOfPeople',
                      textAlign: TextAlign.center,
                      style: Theme.of(context)
                          .textTheme
                          .titleMedium
                          ?.copyWith(fontWeight: FontWeight.bold),
                    ),
                  ),
                  IconButton(
                    onPressed: () => setState(() => _numberOfPeople++),
                    icon: const Icon(Icons.add),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Servicio (si está disponible)
            if (widget.serviceIds != null && widget.serviceIds!.isNotEmpty) ...[
              Text(
                'Servicio (Opcional)',
                style: Theme.of(context).textTheme.labelMedium,
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey[300]!),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: DropdownButton<String>(
                  value: _selectedServiceId,
                  hint: const Text('Selecciona un servicio'),
                  isExpanded: true,
                  underline: const SizedBox(),
                  items: [
                    DropdownMenuItem(
                      value: null,
                      child: const Text('Sin servicio específico'),
                    ),
                    ...widget.serviceIds!.map(
                      (id) => DropdownMenuItem(
                        value: id,
                        child: Text('Servicio'),
                      ),
                    ),
                  ],
                  onChanged: (value) {
                    setState(() => _selectedServiceId = value);
                  },
                ),
              ),
              const SizedBox(height: 24),
            ],
            // Error
            if (_error != null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: Colors.red),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _error!,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 24),
            // Botón crear
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : () => _createReservation(),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Crear Reserva'),
              ),
            ),
            const SizedBox(height: 16),
            // Botón cancelar
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancelar'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() => _selectedDate = picked);
    }
  }

  Future<void> _selectTime(BuildContext context) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
    );
    if (picked != null && picked != _selectedTime) {
      setState(() => _selectedTime = picked);
    }
  }

  Future<void> _createReservation() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final reservationTime =
          '${_selectedTime.hour.toString().padLeft(2, '0')}:${_selectedTime.minute.toString().padLeft(2, '0')}';

      final reservation =
          await context.read<ReservationsProvider>().createReservation(
                businessId: widget.businessId,
                reservationDate:
                    _selectedDate.toIso8601String().split('T').first,
                numberOfPeople: _numberOfPeople,
                serviceId: _selectedServiceId,
                reservationTime: reservationTime,
              );

      if (reservation != null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Reserva creada exitosamente')),
        );
        Navigator.pop(context, reservation);
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  IconData _getBusinessIcon(String? type) {
    switch (type?.toLowerCase()) {
      case 'restaurant':
      case 'bar':
      case 'cafe':
        return Icons.restaurant;
      case 'hotel':
      case 'hostel':
        return Icons.hotel;
      case 'tour':
        return Icons.explore;
      case 'entertainment':
        return Icons.theaters;
      case 'spa':
        return Icons.spa;
      default:
        return Icons.store;
    }
  }
}
