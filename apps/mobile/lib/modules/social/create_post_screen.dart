import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:video_player/video_player.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/social_provider.dart';

class CreatePostScreen extends StatefulWidget {
  const CreatePostScreen({super.key});

  @override
  State<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends State<CreatePostScreen> {
  final _picker = ImagePicker();
  final _captionController = TextEditingController();

  bool _isReel = false;
  List<File> _images = [];
  File? _video;
  VideoPlayerController? _videoController;

  @override
  void dispose() {
    _captionController.dispose();
    _videoController?.dispose();
    super.dispose();
  }

  Future<void> _pickImages() async {
    final picked = await _picker.pickMultiImage(imageQuality: 85);
    if (picked.isEmpty) return;
    setState(() {
      _images = picked.map((x) => File(x.path)).toList();
    });
  }

  Future<void> _pickVideo() async {
    final picked = await _picker.pickVideo(source: ImageSource.gallery);
    if (picked == null) return;

    _videoController?.dispose();
    final controller = VideoPlayerController.file(File(picked.path));
    await controller.initialize();
    controller.setLooping(true);
    controller.play();

    setState(() {
      _video = File(picked.path);
      _videoController = controller;
    });
  }

  Future<void> _submit() async {
    final provider = context.read<SocialProvider>();
    final caption = _captionController.text.trim();

    bool success;
    if (_isReel) {
      if (_video == null) {
        _showSnack('Selecciona un video para tu reel', isError: true);
        return;
      }
      success = await provider.createReel(videoPath: _video!.path, caption: caption);
    } else {
      if (_images.isEmpty) {
        _showSnack('Selecciona al menos una foto', isError: true);
        return;
      }
      success = await provider.createPost(
        caption: caption,
        mediaPaths: _images.map((f) => f.path).toList(),
      );
    }

    if (!mounted) return;

    if (success) {
      Navigator.of(context).pop(true);
    } else {
      _showSnack(provider.error ?? 'Error al publicar', isError: true);
    }
  }

  void _showSnack(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<SocialProvider>();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppTheme.ink,
        title: const Text('Crear publicación'),
        actions: [
          TextButton(
            onPressed: provider.isLoading ? null : _submit,
            child: provider.isLoading
                ? const SizedBox(
                    width: 18, height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Publicar', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppTheme.sand,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Row(
                children: [
                  Expanded(child: _modeTab('Foto', !_isReel, () => setState(() => _isReel = false))),
                  Expanded(child: _modeTab('Video (Reel)', _isReel, () => setState(() => _isReel = true))),
                ],
              ),
            ),
            const SizedBox(height: 20),
            if (!_isReel) _buildImagePicker() else _buildVideoPicker(),
            const SizedBox(height: 20),
            TextField(
              controller: _captionController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: '¿Qué quieres compartir?',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _modeTab(String label, bool selected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: selected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          boxShadow: selected
              ? [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 6)]
              : null,
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: selected ? AppTheme.ink : AppTheme.mute,
          ),
        ),
      ),
    );
  }

  Widget _buildImagePicker() {
    if (_images.isEmpty) {
      return GestureDetector(
        onTap: _pickImages,
        child: Container(
          height: 200,
          decoration: BoxDecoration(
            color: AppTheme.sand,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.line),
          ),
          child: const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.add_photo_alternate_outlined, size: 40, color: AppTheme.mute),
                SizedBox(height: 8),
                Text('Toca para elegir fotos', style: TextStyle(color: AppTheme.mute)),
              ],
            ),
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 120,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _images.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, i) => ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.file(_images[i], width: 120, height: 120, fit: BoxFit.cover),
            ),
          ),
        ),
        const SizedBox(height: 8),
        TextButton.icon(
          onPressed: _pickImages,
          icon: const Icon(Icons.refresh),
          label: const Text('Cambiar fotos'),
        ),
      ],
    );
  }

  Widget _buildVideoPicker() {
    if (_video == null || _videoController == null || !_videoController!.value.isInitialized) {
      return GestureDetector(
        onTap: _pickVideo,
        child: Container(
          height: 200,
          decoration: BoxDecoration(
            color: AppTheme.sand,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.line),
          ),
          child: const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.video_call_outlined, size: 40, color: AppTheme.mute),
                SizedBox(height: 8),
                Text('Toca para elegir un video', style: TextStyle(color: AppTheme.mute)),
              ],
            ),
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: AspectRatio(
            aspectRatio: _videoController!.value.aspectRatio,
            child: VideoPlayer(_videoController!),
          ),
        ),
        const SizedBox(height: 8),
        TextButton.icon(
          onPressed: _pickVideo,
          icon: const Icon(Icons.refresh),
          label: const Text('Cambiar video'),
        ),
      ],
    );
  }
}
