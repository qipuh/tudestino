import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/verification_provider.dart';

class VerifyIdentityScreen extends StatefulWidget {
  const VerifyIdentityScreen({super.key});

  @override
  State<VerifyIdentityScreen> createState() => _VerifyIdentityScreenState();
}

class _VerifyIdentityScreenState extends State<VerifyIdentityScreen> {
  final _formKey = GlobalKey<FormState>();
  final _documentNumberController = TextEditingController();
  final _picker = ImagePicker();

  String _documentType = 'DNI';
  File? _documentFront;
  File? _selfie;

  static const _documentTypes = ['DNI', 'Pasaporte', 'Carné de Extranjería', 'Licencia de Conducir'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<VerificationProvider>().loadStatus();
    });
  }

  @override
  void dispose() {
    _documentNumberController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(bool isSelfie) async {
    final source = isSelfie ? ImageSource.camera : ImageSource.gallery;
    final picked = await _picker.pickImage(source: source, imageQuality: 85);
    if (picked == null) return;
    setState(() {
      if (isSelfie) {
        _selfie = File(picked.path);
      } else {
        _documentFront = File(picked.path);
      }
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    if (_documentFront == null || _selfie == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Debes subir la foto del documento y una selfie'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    final provider = context.read<VerificationProvider>();
    final success = await provider.submitIdentity(
      documentType: _documentType,
      documentNumber: _documentNumberController.text.trim(),
      documentFrontPath: _documentFront!.path,
      selfiePath: _selfie!.path,
    );

    if (!mounted) return;

    if (success) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Solicitud enviada'),
          content: const Text('Revisaremos tu documentación pronto. Te avisaremos cuando tu identidad esté verificada.'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.of(context).pop();
              },
              child: const Text('Entendido'),
            ),
          ],
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(provider.error ?? 'Error al enviar la verificación'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Widget _imagePickerBox({
    required String label,
    required File? file,
    required VoidCallback onTap,
    required IconData icon,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 160,
        decoration: BoxDecoration(
          color: AppTheme.sand,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.line),
        ),
        clipBehavior: Clip.antiAlias,
        child: file != null
            ? Stack(
                fit: StackFit.expand,
                children: [
                  Image.file(file, fit: BoxFit.cover),
                  Positioned(
                    right: 8,
                    top: 8,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(color: Colors.black54, shape: BoxShape.circle),
                      child: const Icon(Icons.edit, color: Colors.white, size: 16),
                    ),
                  ),
                ],
              )
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(icon, size: 36, color: AppTheme.mute),
                  const SizedBox(height: 8),
                  Text(label, style: TextStyle(color: AppTheme.mute, fontSize: 13)),
                ],
              ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<VerificationProvider>();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppTheme.ink,
        title: const Text('Verificar identidad'),
      ),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : provider.status == 'pending'
              ? _buildPendingState()
              : provider.status == 'verified'
                  ? _buildVerifiedState()
                  : _buildForm(),
    );
  }

  Widget _buildPendingState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.hourglass_top, size: 56, color: AppTheme.primaryColor),
            const SizedBox(height: 16),
            const Text(
              'Tu verificación está en revisión',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Te avisaremos apenas se apruebe. Esto suele tomar poco tiempo.',
              style: TextStyle(color: AppTheme.mute),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVerifiedState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.verified, size: 56, color: AppTheme.secondaryColor),
            const SizedBox(height: 16),
            const Text(
              'Tu identidad ya está verificada',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Volver'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildForm() {
    final provider = context.watch<VerificationProvider>();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Para reservar necesitamos confirmar quién eres',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 6),
            Text(
              'Sube tu documento de identidad y una selfie. Es rápido y solo se usa para verificación.',
              style: TextStyle(color: AppTheme.mute),
            ),
            const SizedBox(height: 24),
            DropdownButtonFormField<String>(
              initialValue: _documentType,
              decoration: InputDecoration(
                labelText: 'Tipo de documento',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              items: _documentTypes
                  .map((type) => DropdownMenuItem(value: type, child: Text(type)))
                  .toList(),
              onChanged: (value) => setState(() => _documentType = value ?? _documentType),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _documentNumberController,
              decoration: InputDecoration(
                labelText: 'Número de documento',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              validator: (value) {
                if (value == null || value.trim().length < 5) {
                  return 'Ingresa un número de documento válido';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),
            Text('Foto del documento (frontal)', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            _imagePickerBox(
              label: 'Toca para elegir una foto',
              file: _documentFront,
              icon: Icons.badge_outlined,
              onTap: () => _pickImage(false),
            ),
            const SizedBox(height: 24),
            Text('Selfie', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            _imagePickerBox(
              label: 'Toca para tomar una selfie',
              file: _selfie,
              icon: Icons.camera_alt_outlined,
              onTap: () => _pickImage(true),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: provider.isSubmitting ? null : _submit,
                child: provider.isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Enviar verificación'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
