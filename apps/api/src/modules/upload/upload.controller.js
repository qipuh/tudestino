import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio uploads si no existe
const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadType = req.params.uploadType || 'general';
    const dest = path.join(uploadsDir, uploadType);

    // Crear subdirectorio si no existe
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    cb(null, dest);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, basename + '-' + uniqueSuffix + ext);
  }
});

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

class UploadController {
  /**
   * Upload de una sola imagen
   * POST /api/upload/:uploadType/single
   */
  uploadSingle(uploadType) {
    return [
      upload.single('image'),
      (req, res) => {
        try {
          if (!req.file) {
            return res.status(400).json({
              success: false,
              message: 'No se recibió ningún archivo'
            });
          }

          // Construir URL relativa del archivo
          const fileUrl = `/uploads/${uploadType}/${req.file.filename}`;

          return res.status(200).json({
            success: true,
            message: 'Imagen subida exitosamente',
            data: {
              filename: req.file.filename,
              originalName: req.file.originalname,
              mimetype: req.file.mimetype,
              size: req.file.size,
              url: fileUrl,
              fullPath: req.file.path
            }
          });
        } catch (error) {
          console.error('Error en uploadSingle:', error);
          return res.status(500).json({
            success: false,
            message: error.message
          });
        }
      }
    ];
  }

  /**
   * Upload de múltiples imágenes
   * POST /api/upload/:uploadType/multiple
   */
  uploadMultiple(uploadType) {
    return [
      upload.array('images', 10), // Máximo 10 imágenes
      (req, res) => {
        try {
          if (!req.files || req.files.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'No se recibieron archivos'
            });
          }

          const files = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/${uploadType}/${file.filename}`,
            fullPath: file.path
          }));

          return res.status(200).json({
            success: true,
            message: `${files.length} imagen(es) subida(s) exitosamente`,
            data: files
          });
        } catch (error) {
          console.error('Error en uploadMultiple:', error);
          return res.status(500).json({
            success: false,
            message: error.message
          });
        }
      }
    ];
  }

  /**
   * Eliminar una imagen
   * DELETE /api/upload/:uploadType/:filename
   */
  deleteImage(req, res) {
    try {
      const { uploadType, filename } = req.params;
      const filePath = path.join(uploadsDir, uploadType, filename);

      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado'
        });
      }

      // Eliminar el archivo
      fs.unlinkSync(filePath);

      return res.status(200).json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error en deleteImage:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new UploadController();
