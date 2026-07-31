import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/auth_provider.dart';
import 'package:provider/provider.dart';
import 'card_payment_screen.dart';
import 'culqi_webview_payment_screen.dart';

/// Elegir cómo pagar una reserva ya creada (pending). Tarjeta usa
/// tokenización directa (sin salir de la app); Yape/billetera/agente
/// necesitan la UI propia de Culqi, así que abren su widget en un WebView.
class PaymentMethodScreen extends StatelessWidget {
  final String bookingId;
  final double amount;
  final String propertyName;

  const PaymentMethodScreen({
    super.key,
    required this.bookingId,
    required this.amount,
    required this.propertyName,
  });

  Future<void> _openCard(BuildContext context) async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => CardPaymentScreen(
          bookingId: bookingId,
          amount: amount,
          propertyName: propertyName,
        ),
      ),
    );
    if (context.mounted) Navigator.of(context).pop(result ?? false);
  }

  Future<void> _openWallet(BuildContext context) async {
    final email = context.read<AuthProvider>().user?.email ?? '';
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => CulqiWebviewPaymentScreen(
          bookingId: bookingId,
          amount: amount,
          propertyName: propertyName,
          email: email,
        ),
      ),
    );
    if (context.mounted) Navigator.of(context).pop(result ?? false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppTheme.ink,
        title: const Text('Método de pago'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
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
                        Text(propertyName, style: const TextStyle(fontWeight: FontWeight.w600)),
                        const Text('Total a pagar', style: TextStyle(color: AppTheme.mute, fontSize: 12)),
                      ],
                    ),
                  ),
                  Text(
                    'S/ ${amount.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            _PaymentOption(
              icon: Icons.credit_card,
              title: 'Tarjeta de crédito o débito',
              subtitle: 'Visa, Mastercard, Amex, Diners',
              onTap: () => _openCard(context),
            ),
            const SizedBox(height: 16),
            _PaymentOption(
              icon: Icons.qr_code_2,
              title: 'Yape',
              subtitle: 'Paga con tu celular',
              onTap: () => _openWallet(context),
            ),
            const SizedBox(height: 16),
            _PaymentOption(
              icon: Icons.account_balance_wallet_outlined,
              title: 'Billetera móvil / Agente / Banca móvil',
              subtitle: 'Otras formas de pago Culqi',
              onTap: () => _openWallet(context),
            ),
          ],
        ),
      ),
    );
  }
}

class _PaymentOption extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _PaymentOption({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: AppTheme.primaryColor),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(color: AppTheme.mute, fontSize: 12)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppTheme.mute),
          ],
        ),
      ),
    );
  }
}
