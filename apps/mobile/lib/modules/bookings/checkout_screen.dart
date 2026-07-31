import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../../core/utils/currency_formatter.dart';
import '../../providers/properties_provider.dart';
import '../../providers/bookings_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/property.dart';
import '../../models/room.dart';

class CheckoutScreen extends StatefulWidget {
  final String propertyId;
  final String roomId;
  final DateTime checkIn;
  final DateTime checkOut;
  final int adults;
  final int children;

  const CheckoutScreen({
    super.key,
    required this.propertyId,
    required this.roomId,
    required this.checkIn,
    required this.checkOut,
    required this.adults,
    required this.children,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _specialRequestsController = TextEditingController();

  bool _agreedToTerms = false;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final propertiesProvider = Provider.of<PropertiesProvider>(context, listen: false);
      propertiesProvider.loadPropertyDetail(widget.propertyId);

      // Pre-llenar con datos del usuario si está autenticado
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      if (authProvider.isAuthenticated && authProvider.user != null) {
        _nameController.text = authProvider.user!.name;
        _emailController.text = authProvider.user!.email;
        _phoneController.text = authProvider.user!.phone ?? '';
      }
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _specialRequestsController.dispose();
    super.dispose();
  }

  int get nights => widget.checkOut.difference(widget.checkIn).inDays;

  double _calculateSubtotal(Room room) {
    return room.pricePerNight * nights;
  }

  double _calculateCleaningFee(Room room) {
    // Tarifa de limpieza: 10% del subtotal o mínimo $20
    final fee = _calculateSubtotal(room) * 0.10;
    return fee < 20 ? 20 : fee;
  }

  double _calculateServiceFee(Room room) {
    // Tarifa de servicio: 12% del subtotal
    return _calculateSubtotal(room) * 0.12;
  }

  double _calculateTaxes(Room room) {
    // Impuestos: 18% sobre subtotal + tarifas
    final subtotal = _calculateSubtotal(room);
    final fees = _calculateCleaningFee(room) + _calculateServiceFee(room);
    return (subtotal + fees) * 0.18;
  }

  double _calculateTotal(Room room) {
    final subtotal = _calculateSubtotal(room);
    final cleaning = _calculateCleaningFee(room);
    final service = _calculateServiceFee(room);
    final taxes = _calculateTaxes(room);
    return subtotal + cleaning + service + taxes;
  }

  Future<void> _processBooking(Property property, Room room) async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (!_agreedToTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Debes aceptar los términos y condiciones'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() {
      _isProcessing = true;
    });

    final bookingsProvider = Provider.of<BookingsProvider>(context, listen: false);

    final success = await bookingsProvider.createBooking(
      propertyId: widget.propertyId,
      roomId: widget.roomId,
      checkIn: widget.checkIn,
      checkOut: widget.checkOut,
      adults: widget.adults,
      children: widget.children,
    );

    setState(() {
      _isProcessing = false;
    });

    if (mounted) {
      if (success) {
        final bookingId = bookingsProvider.lastCreatedBookingId;
        if (bookingId == null) {
          // No debería pasar si success es true, pero por si acaso no
          // dejamos al usuario colgado sin saber qué pasó con su reserva.
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => _buildSuccessDialog(property, room),
          );
          return;
        }

        final paid = await Navigator.of(context).pushNamed(
          '/card-payment',
          arguments: {
            'bookingId': bookingId,
            'amount': _calculateTotal(room),
            'propertyName': property.displayName,
          },
        );

        if (!mounted) return;

        if (paid == true) {
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => _buildSuccessDialog(property, room),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Tu reserva quedó pendiente de pago. Puedes completarla desde "Mis reservas".'),
              backgroundColor: Colors.orange,
            ),
          );
        }
      } else if (bookingsProvider.errorCode == 'IDENTITY_NOT_VERIFIED') {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Text('Verifica tu identidad'),
            content: const Text(
              'Para reservar necesitamos confirmar quién eres. Es rápido: solo necesitas tu documento y una selfie.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Ahora no'),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  Navigator.of(context).pushNamed('/verify-identity');
                },
                child: const Text('Verificar identidad'),
              ),
            ],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(bookingsProvider.error ?? 'Error al procesar la reserva'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Widget _buildSuccessDialog(Property property, Room room) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check_circle,
                color: Colors.green,
                size: 60,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              '¡Reserva Confirmada!',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              property.displayName,
              style: const TextStyle(fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              '${DateFormat('d MMM yyyy').format(widget.checkIn)} - ${DateFormat('d MMM yyyy').format(widget.checkOut)}',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Recibirás un email de confirmación en breve',
              style: TextStyle(fontSize: 14),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop(); // Cerrar diálogo
                  Navigator.of(context).pushNamedAndRemoveUntil(
                    '/bookings',
                    (route) => route.isFirst,
                  );
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('Ver mis reservas'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final propertiesProvider = Provider.of<PropertiesProvider>(context);
    final property = propertiesProvider.selectedProperty;
    final theme = Theme.of(context);

    if (propertiesProvider.isLoading || property == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Checkout'),
          backgroundColor: Colors.white,
          elevation: 0,
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final room = property.rooms.firstWhere((r) => r.id == widget.roomId);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Text('Confirmar y pagar'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Resumen de la propiedad
                _buildPropertySummary(property, room, theme),

                const SizedBox(height: 20),

                // Detalles de la reserva
                _buildBookingDetails(property, room, theme),

                const SizedBox(height: 20),

                // Información del huésped
                _buildGuestInformation(theme),

                const SizedBox(height: 20),

                // Desglose de precios
                _buildPriceBreakdown(room, theme),

                const SizedBox(height: 20),

                // Políticas
                _buildPolicies(property, theme),

                const SizedBox(height: 20),

                // Términos y condiciones
                _buildTermsCheckbox(theme),

                const SizedBox(height: 100),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomBar(property, room, theme),
    );
  }

  Widget _buildPropertySummary(Property property, Room room, ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Imagen
          if (room.images.isNotEmpty)
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: CachedNetworkImage(
                imageUrl: room.images.first,
                height: 180,
                width: double.infinity,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  height: 180,
                  color: Colors.grey.shade200,
                  child: const Center(child: CircularProgressIndicator()),
                ),
                errorWidget: (context, url, error) => Container(
                  height: 180,
                  color: Colors.grey.shade200,
                  child: const Icon(Icons.error, size: 40),
                ),
              ),
            ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  property.displayName,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.location_on, size: 16, color: Colors.grey.shade600),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        property.fullAddress,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: theme.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.bed, size: 16, color: theme.primaryColor),
                      const SizedBox(width: 6),
                      Text(
                        room.name,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: theme.primaryColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingDetails(Property property, Room room, ThemeData theme) {
    final dateFormat = DateFormat('d MMM yyyy', 'es');

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Detalles de tu viaje',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          // Fechas
          Row(
            children: [
              Expanded(
                child: _buildDetailItem(
                  Icons.login,
                  'Check-in',
                  dateFormat.format(widget.checkIn),
                  property.checkInTime,
                  theme,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildDetailItem(
                  Icons.logout,
                  'Check-out',
                  dateFormat.format(widget.checkOut),
                  property.checkOutTime,
                  theme,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Duración y huéspedes
          Row(
            children: [
              Expanded(
                child: _buildDetailItem(
                  Icons.nights_stay,
                  'Duración',
                  '$nights ${nights == 1 ? "noche" : "noches"}',
                  null,
                  theme,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildDetailItem(
                  Icons.people,
                  'Huéspedes',
                  '${widget.adults} ${widget.adults == 1 ? "adulto" : "adultos"}',
                  widget.children > 0
                      ? '${widget.children} ${widget.children == 1 ? "niño" : "niños"}'
                      : null,
                  theme,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDetailItem(
    IconData icon,
    String label,
    String value,
    String? subtitle,
    ThemeData theme,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: theme.primaryColor),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade600,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildGuestInformation(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Información del huésped',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),

            // Nombre
            TextFormField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Nombre completo',
                prefixIcon: const Icon(Icons.person_outline),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Colors.grey.shade50,
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Por favor ingresa tu nombre';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),

            // Email
            TextFormField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                labelText: 'Email',
                prefixIcon: const Icon(Icons.email_outlined),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Colors.grey.shade50,
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Por favor ingresa tu email';
                }
                if (!value.contains('@')) {
                  return 'Email inválido';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),

            // Teléfono
            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                labelText: 'Teléfono',
                prefixIcon: const Icon(Icons.phone_outlined),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Colors.grey.shade50,
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Por favor ingresa tu teléfono';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),

            // Peticiones especiales
            TextFormField(
              controller: _specialRequestsController,
              maxLines: 3,
              decoration: InputDecoration(
                labelText: 'Peticiones especiales (opcional)',
                hintText: 'Ej: Llegada tarde, cama extra, etc.',
                prefixIcon: const Icon(Icons.message_outlined),
                alignLabelWithHint: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Colors.grey.shade50,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriceBreakdown(Room room, ThemeData theme) {
    final subtotal = _calculateSubtotal(room);
    final cleaning = _calculateCleaningFee(room);
    final service = _calculateServiceFee(room);
    final taxes = _calculateTaxes(room);
    final total = _calculateTotal(room);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Desglose de precios',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          _buildPriceRow(
            '${CurrencyFormatter.format(room.pricePerNight)} x $nights ${nights == 1 ? "noche" : "noches"}',
            CurrencyFormatter.format(subtotal),
            false,
          ),
          const SizedBox(height: 8),
          _buildPriceRow(
            'Tarifa de limpieza',
            CurrencyFormatter.format(cleaning),
            false,
          ),
          const SizedBox(height: 8),
          _buildPriceRow(
            'Tarifa de servicio',
            CurrencyFormatter.format(service),
            false,
          ),
          const SizedBox(height: 8),
          _buildPriceRow(
            'Impuestos',
            CurrencyFormatter.format(taxes),
            false,
          ),
          const Divider(height: 24),
          _buildPriceRow(
            'Total',
            CurrencyFormatter.format(total),
            true,
            theme.primaryColor,
          ),
        ],
      ),
    );
  }

  Widget _buildPriceRow(String label, String value, bool isBold, [Color? color]) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isBold ? 18 : 15,
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            color: color,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isBold ? 18 : 15,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildPolicies(Property property, ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Políticas de la propiedad',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          _buildPolicyItem(
            Icons.cancel_outlined,
            'Cancelación',
            _getCancellationPolicyText(property.cancellationPolicy),
            theme,
          ),
          const SizedBox(height: 12),

          if (!property.childrenAllowed)
            _buildPolicyItem(
              Icons.child_care_outlined,
              'Niños',
              'No se permiten niños',
              theme,
            ),

          if (!property.childrenAllowed) const SizedBox(height: 12),

          _buildPolicyItem(
            Icons.pets_outlined,
            'Mascotas',
            property.petsAllowed == 'yes'
                ? 'Se permiten mascotas${property.petFee != null ? " (+${CurrencyFormatter.format(property.petFee!)})" : ""}'
                : 'No se permiten mascotas',
            theme,
          ),

          if (property.additionalRules != null && property.additionalRules!.isNotEmpty) ...[
            const SizedBox(height: 12),
            _buildPolicyItem(
              Icons.rule_outlined,
              'Normas adicionales',
              property.additionalRules!,
              theme,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPolicyItem(IconData icon, String title, String description, ThemeData theme) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: theme.primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 20, color: theme.primaryColor),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                description,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade700,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  String _getCancellationPolicyText(String policy) {
    switch (policy) {
      case 'flexible':
        return 'Cancelación gratuita hasta 24 horas antes del check-in';
      case 'moderate':
        return 'Cancelación gratuita hasta 5 días antes del check-in';
      case 'strict':
        return 'Cancelación gratuita hasta 14 días antes del check-in';
      case 'super_strict':
        return 'Cancelación gratuita hasta 30 días antes del check-in';
      default:
        return 'Consulta las políticas de cancelación con el anfitrión';
    }
  }

  Widget _buildTermsCheckbox(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: _agreedToTerms ? theme.primaryColor : Colors.grey.shade300,
          width: _agreedToTerms ? 2 : 1,
        ),
      ),
      child: Row(
        children: [
          Checkbox(
            value: _agreedToTerms,
            onChanged: (value) {
              setState(() {
                _agreedToTerms = value ?? false;
              });
            },
            activeColor: theme.primaryColor,
          ),
          Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _agreedToTerms = !_agreedToTerms;
                });
              },
              child: RichText(
                text: TextSpan(
                  style: const TextStyle(fontSize: 14, color: Colors.black87),
                  children: [
                    const TextSpan(text: 'Acepto los '),
                    TextSpan(
                      text: 'términos y condiciones',
                      style: TextStyle(
                        color: theme.primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const TextSpan(text: ' y las '),
                    TextSpan(
                      text: 'políticas de privacidad',
                      style: TextStyle(
                        color: theme.primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar(Property property, Room room, ThemeData theme) {
    final total = _calculateTotal(room);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Total',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey.shade600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    CurrencyFormatter.format(total),
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: theme.primaryColor,
                    ),
                  ),
                ],
              ),
            ),
            ElevatedButton(
              onPressed: _isProcessing ? null : () => _processBooking(property, room),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 18),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 2,
              ),
              child: _isProcessing
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text(
                      'Confirmar y pagar',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
