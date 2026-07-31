import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../providers/route_provider.dart';
import '../../models/gps_route.dart';

/// Editar título/descripción/ciudad/portada de una ruta ya guardada.
/// Mismo formulario que save_route_screen.dart pero pre-llenado, sin
/// trackPoints/stats (esos no se pueden editar).
class EditRouteScreen extends StatefulWidget {
  final GpsRoute route;

  const EditRouteScreen({super.key, required this.route});

  @override
  State<EditRouteScreen> createState() => _EditRouteScreenState();
}

class _EditRouteScreenState extends State<EditRouteScreen> {
  late final _titleController = TextEditingController(text: widget.route.title);
  late final _descriptionController = TextEditingController(text: widget.route.description ?? '');
  late final _cityController = TextEditingController(text: widget.route.city ?? '');
  String? _newCoverImagePath;
  bool _saving = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  Future<void> _pickCoverImage() async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt_outlined),
              title: const Text('Tomar foto'),
              onTap: () => Navigator.pop(ctx, ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('Elegir de galería'),
              onTap: () => Navigator.pop(ctx, ImageSource.gallery),
            ),
          ],
        ),
      ),
    );
    if (source == null) return;

    final picked = await ImagePicker().pickImage(source: source, imageQuality: 80);
    if (picked != null) {
      setState(() => _newCoverImagePath = picked.path);
    }
  }

  Future<void> _handleSave() async {
    if (_titleController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Ponle un título a tu ruta')));
      return;
    }

    setState(() => _saving = true);

    final provider = context.read<RouteProvider>();
    final updated = await provider.updateRoute(
      widget.route.id,
      title: _titleController.text.trim(),
      description: _descriptionController.text.trim(),
      city: _cityController.text.trim(),
      coverImagePath: _newCoverImagePath,
    );

    if (!mounted) return;
    setState(() => _saving = false);

    if (updated != null) {
      Navigator.of(context).pop(updated);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(provider.error ?? 'No se pudo actualizar la ruta')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Editar ruta')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GestureDetector(
            onTap: _pickCoverImage,
            child: Container(
              height: 160,
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(12),
                image: _newCoverImagePath != null
                    ? DecorationImage(image: FileImage(File(_newCoverImagePath!)), fit: BoxFit.cover)
                    : null,
              ),
              child: _newCoverImagePath == null
                  ? (widget.route.coverImage != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: CachedNetworkImage(
                            imageUrl: widget.route.coverImage!,
                            fit: BoxFit.cover,
                            width: double.infinity,
                            height: 160,
                          ),
                        )
                      : const Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.add_a_photo, size: 32, color: Colors.grey),
                              SizedBox(height: 8),
                              Text('Agregar foto de portada'),
                            ],
                          ),
                        ))
                  : null,
            ),
          ),
          const SizedBox(height: 8),
          const Text('Toca la imagen para cambiar la portada', style: TextStyle(fontSize: 12, color: Colors.grey)),
          const SizedBox(height: 16),
          TextField(
            controller: _titleController,
            decoration: const InputDecoration(labelText: 'Título'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _descriptionController,
            decoration: const InputDecoration(labelText: 'Descripción (opcional)'),
            maxLines: 3,
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _cityController,
            decoration: const InputDecoration(labelText: 'Ciudad (opcional)'),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _saving ? null : _handleSave,
            style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 48)),
            child: _saving
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Guardar cambios'),
          ),
        ],
      ),
    );
  }
}
