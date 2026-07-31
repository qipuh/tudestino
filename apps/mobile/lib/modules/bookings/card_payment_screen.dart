import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/culqi_service.dart';
import '../../core/services/api_service.dart';
import '../../providers/auth_provider.dart';
import '../../providers/bookings_provider.dart';

/// Formulario de tarjeta para cobrar una reserva ya creada (status pending,
/// paymentStatus pending) vía Culqi. No hay SDK oficial de Culqi para
/// Flutter, así que se tokeniza directo contra su API con la llave pública.
class CardPaymentScreen extends StatefulWidget {
  final String bookingId;
  final double amount;
  final String propertyName;

  const CardPaymentScreen({
    super.key,
    required this.bookingId,
    required this.amount,
    required this.propertyName,
  });

  @override
  State<CardPaymentScreen> createState() => _CardPaymentScreenState();
}

class _CardPaymentScreenState extends State<CardPaymentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _cardNumberController = TextEditingController();
  final _expiryController = TextEditingController();
  final _cvvController = TextEditingController();

  bool _isProcessing = false;

  @override
  void dispose() {
    _cardNumberController.dispose();
    _expiryController.dispose();
    _cvvController.dispose();
    super.dispose();
  }

  Future<void> _pay() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    final email = authProvider.user?.email;
    if (email == null) return;

    setState(() => _isProcessing = true);

    final expiryParts = _expiryController.text.split('/');
    final month = expiryParts[0].trim();
    final year = '20${expiryParts[1].trim()}';

    try {
      final token = await CulqiService.createToken(
        ApiService(),
        cardNumber: _cardNumberController.text,
        cvv: _cvvController.text,
        expirationMonth: month,
        expirationYear: year,
        email: email,
      );

      if (!mounted) return;

      final bookingsProvider = context.read<BookingsProvider>();
      final success = await bookingsProvider.chargeBookingWithCulqi(widget.bookingId, token);

      if (!mounted) return;
      setState(() => _isProcessing = false);

      if (success) {
        Navigator.of(context).pop(true);
      } else {
        _showError(bookingsProvider.error ?? 'No se pudo procesar el pago');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isProcessing = false);
      _showError(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppTheme.ink,
        title: const Text('Pagar con tarjeta'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.sand,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(widget.propertyName, style: const TextStyle(fontWeight: FontWeight.w600)),
                          const Text('Total a pagar', style: TextStyle(color: AppTheme.mute, fontSize: 12)),
                        ],
                      ),
                    ),
                    Text(
                      'S/ ${widget.amount.toStringAsFixed(2)}',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              TextFormField(
                controller: _cardNumberController,
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(16),
                ],
                decoration: InputDecoration(
                  labelText: 'Número de tarjeta',
                  prefixIcon: const Icon(Icons.credit_card),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                validator: (v) {
                  if (v == null || v.trim().length < 15) return 'Número de tarjeta inválido';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _expiryController,
                      keyboardType: TextInputType.number,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(4),
                        _ExpiryDateFormatter(),
                      ],
                      decoration: InputDecoration(
                        labelText: 'MM/AA',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      validator: (v) {
                        if (v == null || !RegExp(r'^\d{2}/\d{2}$').hasMatch(v)) return 'Inválido';
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextFormField(
                      controller: _cvvController,
                      keyboardType: TextInputType.number,
                      obscureText: true,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(4),
                      ],
                      decoration: InputDecoration(
                        labelText: 'CVV',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      validator: (v) {
                        if (v == null || v.length < 3) return 'Inválido';
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Row(
                children: [
                  Icon(Icons.lock_outline, size: 16, color: AppTheme.mute),
                  SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Tus datos se envían cifrados directo a Culqi, nunca pasan por nuestros servidores.',
                      style: TextStyle(fontSize: 12, color: AppTheme.mute),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isProcessing ? null : _pay,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                  ),
                  child: _isProcessing
                      ? const SizedBox(
                          height: 20, width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : Text('Pagar S/ ${widget.amount.toStringAsFixed(2)}'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ExpiryDateFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    final digits = newValue.text.replaceAll(RegExp(r'\D'), '');
    if (digits.length <= 2) {
      return TextEditingValue(text: digits, selection: TextSelection.collapsed(offset: digits.length));
    }
    final formatted = '${digits.substring(0, 2)}/${digits.substring(2, digits.length > 4 ? 4 : digits.length)}';
    return TextEditingValue(text: formatted, selection: TextSelection.collapsed(offset: formatted.length));
  }
}
