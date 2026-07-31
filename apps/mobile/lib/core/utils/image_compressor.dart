import 'dart:io';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:path/path.dart' as path;
import 'package:path_provider/path_provider.dart';

/// Comprime una foto a WebP antes de subirla - reduce el peso real del
/// archivo (no solo la calidad JPEG) para que fotos de cámara de varios MB
/// no se acerquen a los límites de subida del servidor ni tarden en subir
/// con mala señal.
class ImageCompressor {
  static Future<File> toWebp(
    String sourcePath, {
    int quality = 80,
    int minWidth = 1920,
    int minHeight = 1920,
  }) async {
    final tempDir = await getTemporaryDirectory();
    final targetPath = path.join(
      tempDir.path,
      '${DateTime.now().millisecondsSinceEpoch}.webp',
    );

    final result = await FlutterImageCompress.compressAndGetFile(
      sourcePath,
      targetPath,
      quality: quality,
      minWidth: minWidth,
      minHeight: minHeight,
      format: CompressFormat.webp,
    );

    // Si el compresor no soporta el formato de origen (raro, pero posible
    // en algunos dispositivos), seguir con el archivo original en vez de
    // romper el flujo de subida.
    if (result == null) return File(sourcePath);
    return File(result.path);
  }
}
