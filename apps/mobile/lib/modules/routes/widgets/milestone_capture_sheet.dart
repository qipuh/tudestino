import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/image_compressor.dart';

/// Hoja para capturar o editar un hito (foto + comentario pinchado en un
/// punto del recorrido). Sin `milestoneId` es modo "agregar" (durante o
/// después de la grabación); con `milestoneId` + `existingPhotoUrl`/
/// `existingComment` es modo "editar" un hito ya guardado.
///
/// Devuelve vía Navigator.pop un mapa {photoPath, comment, milestoneId,
/// removePhoto} o null si se cancela.
class MilestoneCaptureSheet extends StatefulWidget {
  final String? milestoneId;
  final String? existingPhotoUrl;
  final String? existingComment;

  const MilestoneCaptureSheet({
    super.key,
    this.milestoneId,
    this.existingPhotoUrl,
    this.existingComment,
  });

  bool get isEditing => milestoneId != null;

  @override
  State<MilestoneCaptureSheet> createState() => _MilestoneCaptureSheetState();
}

class _MilestoneCaptureSheetState extends State<MilestoneCaptureSheet> {
  late final _commentController = TextEditingController(text: widget.existingComment ?? '');
  String? _photoPath;
  bool _existingPhotoRemoved = false;
  bool _picking = false;

  bool get _hasAnyPhoto =>
      _photoPath != null || (widget.existingPhotoUrl != null && !_existingPhotoRemoved);

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    setState(() => _picking = true);
    try {
      final image = await ImagePicker().pickImage(source: source);
      if (image != null) {
        final compressed = await ImageCompressor.toWebp(image.path);
        if (mounted) {
          setState(() {
            _photoPath = compressed.path;
            _existingPhotoRemoved = false;
          });
        }
      }
    } finally {
      if (mounted) setState(() => _picking = false);
    }
  }

  void _removePhoto() {
    setState(() {
      _photoPath = null;
      _existingPhotoRemoved = true;
    });
  }

  void _save() {
    final comment = _commentController.text.trim();
    if (!_hasAnyPhoto && comment.isEmpty) return;
    Navigator.of(context).pop({
      'photoPath': _photoPath,
      'comment': comment.isNotEmpty ? comment : null,
      'milestoneId': widget.milestoneId,
      'removePhoto': _existingPhotoRemoved && _photoPath == null,
    });
  }

  @override
  Widget build(BuildContext context) {
    final canSave = _hasAnyPhoto || _commentController.text.trim().isNotEmpty;

    return Padding(
      padding: EdgeInsets.only(
        left: 20, right: 20, top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(widget.isEditing ? 'Editar hito' : 'Agregar hito',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(
            widget.isEditing
                ? 'Cambia la foto o el comentario de este hito.'
                : 'Marca este punto de tu recorrido con una foto o un comentario.',
            style: const TextStyle(color: AppTheme.mute, fontSize: 13),
          ),
          const SizedBox(height: 16),
          if (_photoPath != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.file(File(_photoPath!), height: 160, width: double.infinity, fit: BoxFit.cover),
            )
          else if (widget.existingPhotoUrl != null && !_existingPhotoRemoved)
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: CachedNetworkImage(
                imageUrl: widget.existingPhotoUrl!,
                height: 160,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
          if (_hasAnyPhoto) ...[
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: _removePhoto,
                icon: const Icon(Icons.delete_outline, size: 18, color: Colors.red),
                label: const Text('Quitar foto', style: TextStyle(color: Colors.red)),
              ),
            ),
          ],
          if (_hasAnyPhoto) const SizedBox(height: 4),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _picking ? null : () => _pickImage(ImageSource.camera),
                  icon: const Icon(Icons.camera_alt_outlined),
                  label: Text(_hasAnyPhoto ? 'Repetir foto' : 'Tomar foto'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _picking ? null : () => _pickImage(ImageSource.gallery),
                  icon: const Icon(Icons.photo_library_outlined),
                  label: const Text('Galería'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _commentController,
            maxLines: 3,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              labelText: 'Comentario (opcional)',
              hintText: 'Ej: Mirador con vista increíble',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: canSave ? _save : null,
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
              child: Text(widget.isEditing ? 'Guardar cambios' : 'Guardar hito'),
            ),
          ),
        ],
      ),
    );
  }
}
