import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/api_service.dart';

class HelpSupportScreen extends StatefulWidget {
  const HelpSupportScreen({super.key});

  @override
  State<HelpSupportScreen> createState() => _HelpSupportScreenState();
}

class _HelpSupportScreenState extends State<HelpSupportScreen> {
  String _supportEmail = 'soporte@tudestino.pe';
  String _supportPhone = '+51999999999';

  static const _faqs = <MapEntry<String, String>>[
    MapEntry(
      '¿Cómo hago una reserva?',
      'Busca un alojamiento, elige fechas y huéspedes, y toca "Confirmar y pagar". Necesitas tener tu identidad verificada para completar la reserva.',
    ),
    MapEntry(
      '¿Por qué debo verificar mi identidad?',
      'Es un requisito de seguridad para proteger tanto a huéspedes como a anfitriones antes de confirmar una reserva.',
    ),
    MapEntry(
      '¿Cómo cancelo una reserva?',
      'Ve a "Mis reservas" en tu perfil, selecciona la reserva y toca "Cancelar".',
    ),
    MapEntry(
      '¿Cómo comparto una ruta o publicación?',
      'Usa el ícono de compartir en el detalle de la ruta, tour, atractivo o publicación.',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _loadContact();
  }

  Future<void> _loadContact() async {
    try {
      final response = await ApiService().get('/settings/support-contact');
      final data = response.data['data'];
      if (data != null && mounted) {
        setState(() {
          _supportEmail = data['supportEmail'] ?? _supportEmail;
          _supportPhone = data['supportPhone'] ?? _supportPhone;
        });
      }
    } catch (_) {
      // Silencioso - se queda con los valores por defecto
    }
  }

  Future<void> _sendEmail() async {
    final uri = Uri(
      scheme: 'mailto',
      path: _supportEmail,
      query: 'subject=${Uri.encodeComponent('Ayuda con TuDestino')}',
    );
    await launchUrl(uri);
  }

  Future<void> _openWhatsApp() async {
    final phone = _supportPhone.replaceAll(RegExp(r'[^\d]'), '');
    final uri = Uri.parse('https://wa.me/$phone');
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppTheme.ink,
        title: const Text('Ayuda y soporte'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text('¿En qué podemos ayudarte?', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 20),
          _contactTile(
            icon: Icons.chat_bubble_outline,
            title: 'WhatsApp',
            subtitle: _supportPhone,
            onTap: _openWhatsApp,
          ),
          const SizedBox(height: 12),
          _contactTile(
            icon: Icons.email_outlined,
            title: 'Correo electrónico',
            subtitle: _supportEmail,
            onTap: _sendEmail,
          ),
          const SizedBox(height: 32),
          Text('Preguntas frecuentes', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          ..._faqs.map((faq) => _FaqTile(question: faq.key, answer: faq.value)),
        ],
      ),
    );
  }

  Widget _contactTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Material(
      color: AppTheme.sand,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Icon(icon, color: AppTheme.primaryColor),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
                    Text(subtitle, style: const TextStyle(color: AppTheme.mute, fontSize: 13)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppTheme.mute),
            ],
          ),
        ),
      ),
    );
  }
}

class _FaqTile extends StatefulWidget {
  final String question;
  final String answer;

  const _FaqTile({required this.question, required this.answer});

  @override
  State<_FaqTile> createState() => _FaqTileState();
}

class _FaqTileState extends State<_FaqTile> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        border: Border.all(color: AppTheme.line),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          onExpansionChanged: (v) => setState(() => _expanded = v),
          title: Text(
            widget.question,
            style: TextStyle(fontWeight: _expanded ? FontWeight.w600 : FontWeight.normal),
          ),
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(widget.answer, style: const TextStyle(color: AppTheme.mute, height: 1.4)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
