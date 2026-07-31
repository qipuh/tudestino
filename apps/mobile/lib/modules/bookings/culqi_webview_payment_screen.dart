import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/culqi_service.dart';
import '../../core/services/api_service.dart';
import '../../providers/bookings_provider.dart';

/// No existe SDK oficial de Culqi para Flutter y Yape/billetera/agente/
/// bancaMovil requieren la UI propia de Culqi (celular + código OTP,
/// endpoint privado no documentado públicamente) - en vez de adivinar ese
/// contrato con dinero real de por medio, se embebe el mismo widget
/// checkout.js que ya funciona en la web dentro de un WebView. El widget
/// genera un token igual que con tarjeta y ese token se cobra server-side
/// exactamente con el mismo endpoint que ya existe.
class CulqiWebviewPaymentScreen extends StatefulWidget {
  final String bookingId;
  final double amount;
  final String propertyName;
  final String email;

  const CulqiWebviewPaymentScreen({
    super.key,
    required this.bookingId,
    required this.amount,
    required this.propertyName,
    required this.email,
  });

  @override
  State<CulqiWebviewPaymentScreen> createState() => _CulqiWebviewPaymentScreenState();
}

class _CulqiWebviewPaymentScreenState extends State<CulqiWebviewPaymentScreen> {
  WebViewController? _controller;
  bool _loading = true;
  bool _charging = false;
  bool _finished = false;
  String? _initError;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    try {
      final publicKey = await CulqiService.getPublicKey(ApiService());
      final html = _buildHtml(publicKey);

      final controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setBackgroundColor(Colors.white)
        ..addJavaScriptChannel('CulqiChannel', onMessageReceived: _handleMessage)
        ..loadHtmlString(html, baseUrl: 'https://checkout.culqi.com');

      if (!mounted) return;
      setState(() {
        _controller = controller;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _initError = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  String _buildHtml(String publicKey) {
    final amountInCents = (widget.amount * 100).round();
    final description = jsonEncode('Reserva en ${widget.propertyName}');
    return '''
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<script src="https://checkout.culqi.com/js/v4"></script>
</head>
<body style="margin:0; background:#fff;">
<script>
  window.Culqi.publicKey = ${jsonEncode(publicKey)};

  window.Culqi.settings({
    title: 'TuDestino - Reserva de Alojamiento',
    currency: 'PEN',
    amount: $amountInCents,
    description: $description
  });

  window.Culqi.options({
    lang: 'auto',
    installments: true,
    paymentMethods: {
      tarjeta: true,
      yape: true,
      bancaMovil: true,
      agente: true,
      billetera: true,
      cuotealo: false
    }
  });

  window.culqi = function () {
    if (window.Culqi.token) {
      CulqiChannel.postMessage(JSON.stringify({ type: 'token', id: window.Culqi.token.id }));
    } else if (window.Culqi.error) {
      var msg = (window.Culqi.error && window.Culqi.error.user_message) || 'Error en el pago';
      CulqiChannel.postMessage(JSON.stringify({ type: 'error', message: msg }));
    }
  };

  window.Culqi.open();
</script>
</body>
</html>
''';
  }

  void _handleMessage(JavaScriptMessage message) {
    if (_finished) return;

    Map<String, dynamic> data;
    try {
      data = jsonDecode(message.message) as Map<String, dynamic>;
    } catch (_) {
      return;
    }

    if (data['type'] == 'token') {
      _finished = true;
      _charge(data['id'] as String);
    } else if (data['type'] == 'error') {
      _showError(data['message'] as String? ?? 'Error en el pago');
    }
  }

  Future<void> _charge(String token) async {
    setState(() => _charging = true);

    final bookingsProvider = context.read<BookingsProvider>();
    final success = await bookingsProvider.chargeBookingWithCulqi(widget.bookingId, token);

    if (!mounted) return;

    if (success) {
      Navigator.of(context).pop(true);
    } else {
      setState(() => _charging = false);
      _showError(bookingsProvider.error ?? 'No se pudo procesar el pago');
    }
  }

  void _showError(String message) {
    if (!mounted) return;
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
        title: const Text('Yape / Billetera / Agente'),
      ),
      body: Stack(
        children: [
          if (_controller != null) WebViewWidget(controller: _controller!),
          if (_loading) const Center(child: CircularProgressIndicator()),
          if (_initError != null)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(_initError!, textAlign: TextAlign.center),
              ),
            ),
          if (_charging)
            Container(
              color: Colors.black45,
              child: const Center(
                child: CircularProgressIndicator(color: Colors.white),
              ),
            ),
        ],
      ),
    );
  }
}
