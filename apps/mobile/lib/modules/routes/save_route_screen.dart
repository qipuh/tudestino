import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../../providers/route_provider.dart';
import '../../models/gps_route.dart';
import '../../core/services/route_tracking_service.dart';
import '../../core/utils/image_compressor.dart';

class SaveRouteScreen extends StatefulWidget {
  final List<TrackPoint> trackPoints;
  final double distanceKm;
  final int durationSeconds;
  final double elevationGainM;
  final double avgSpeedKmh;
  final DateTime? startedAt;
  final String activityType;
  final List<RouteMilestoneDraft> milestones;

  const SaveRouteScreen({
    super.key,
    required this.trackPoints,
    required this.distanceKm,
    required this.durationSeconds,
    required this.elevationGainM,
    required this.avgSpeedKmh,
    required this.startedAt,
    required this.activityType,
    this.milestones = const [],
  });

  @override
  State<SaveRouteScreen> createState() => _SaveRouteScreenState();
}

class _SaveRouteScreenState extends State<SaveRouteScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _cityController = TextEditingController();
  String? _coverImagePath;
  bool _saving = false;
  int? _uploadedMilestones;

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

    final picked = await ImagePicker().pickImage(source: source);
    if (picked == null) return;

    // Redimensiona y convierte a WebP - antes solo bajaba la calidad JPEG
    // (imageQuality:80), una foto de 4000x3000 de cámara seguía pesando
    // varios MB con las mismas dimensiones. WebP a igual calidad visual
    // pesa bastante menos que JPEG.
    final compressed = await ImageCompressor.toWebp(picked.path);
    if (mounted) {
      setState(() => _coverImagePath = compressed.path);
    }
  }

  Future<void> _handleSave(RouteProvider provider) async {
    if (_titleController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Ponle un título a tu ruta')));
      return;
    }

    setState(() => _saving = true);

    final route = await provider.saveRoute(
      title: _titleController.text.trim(),
      description: _descriptionController.text.trim().isEmpty
          ? null
          : _descriptionController.text.trim(),
      activityType: widget.activityType,
      city: _cityController.text.trim().isEmpty ? null : _cityController.text.trim(),
      trackPoints: widget.trackPoints,
      distanceKm: widget.distanceKm,
      durationSeconds: widget.durationSeconds,
      elevationGainM: widget.elevationGainM,
      avgSpeedKmh: widget.avgSpeedKmh,
      startedAt: widget.startedAt,
      coverImagePath: _coverImagePath,
      // Solo se usan si hay que encolar por falta de conexión - si sube
      // de una, los hitos se suben acá mismo debajo (ver loop).
      milestones: widget.milestones,
    );

    if (!mounted) return;

    if (route != null) {
      // Best-effort, secuencial (no Future.wait): una foto fallida no debe
      // bloquear el resto ni la ruta, que ya quedó guardada.
      for (var i = 0; i < widget.milestones.length; i++) {
        if (!mounted) return;
        setState(() => _uploadedMilestones = i);
        await provider.addMilestone(route.id, widget.milestones[i]);
      }
      if (!mounted) return;
      Navigator.of(context).pushNamedAndRemoveUntil('/routes-feed', (route) => route.isFirst);
    } else if (provider.wasQueued) {
      Navigator.of(context).pushNamedAndRemoveUntil('/routes-feed', (route) => route.isFirst);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Sin conexión - tu ruta se subirá sola cuando tengas señal'),
          backgroundColor: Colors.orange,
        ),
      );
    } else {
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(provider.error ?? 'No se pudo guardar la ruta')),
      );
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<RouteProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Guardar ruta')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _SummaryStat(label: 'Distancia', value: '${widget.distanceKm.toStringAsFixed(2)} km'),
                  _SummaryStat(
                    label: 'Duración',
                    value: '${(widget.durationSeconds / 60).round()} min',
                  ),
                  _SummaryStat(label: 'Elevación', value: '${widget.elevationGainM.toStringAsFixed(0)} m'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: _pickCoverImage,
            child: Container(
              height: 160,
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(12),
                image: _coverImagePath != null
                    ? DecorationImage(
                        image: FileImage(File(_coverImagePath!)),
                        fit: BoxFit.cover,
                      )
                    : null,
              ),
              child: _coverImagePath == null
                  ? const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.add_a_photo, size: 32, color: Colors.grey),
                          SizedBox(height: 8),
                          Text('Agregar foto de portada (opcional)'),
                        ],
                      ),
                    )
                  : null,
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _titleController,
            decoration: const InputDecoration(labelText: 'Título', hintText: 'Ej. Camino Inca corto'),
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
            decoration: const InputDecoration(labelText: 'Ciudad (opcional)', hintText: 'Ej. Cusco'),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _saving ? null : () => _handleSave(provider),
            style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 48)),
            child: _saving
                ? Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(
                          width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
                      if (_uploadedMilestones != null && widget.milestones.isNotEmpty) ...[
                        const SizedBox(width: 12),
                        Text('Subiendo hitos ${_uploadedMilestones! + 1}/${widget.milestones.length}'),
                      ],
                    ],
                  )
                : const Text('Compartir ruta'),
          ),
        ],
      ),
    );
  }
}

class _SummaryStat extends StatelessWidget {
  final String label;
  final String value;

  const _SummaryStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
      ],
    );
  }
}
