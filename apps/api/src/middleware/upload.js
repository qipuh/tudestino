import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const postsDir = path.join(uploadsDir, 'posts');
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

// Create social media directory
const socialDir = path.join(uploadsDir, 'social');
if (!fs.existsSync(socialDir)) {
  fs.mkdirSync(socialDir, { recursive: true });
}

// Create thumbnails directory for videos
const thumbnailsDir = path.join(socialDir, 'thumbnails');
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Create avatars directory
const avatarsDir = path.join(uploadsDir, 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Create routes directory (fotos de portada de rutas GPS compartidas)
const routesDir = path.join(uploadsDir, 'routes');
if (!fs.existsSync(routesDir)) {
  fs.mkdirSync(routesDir, { recursive: true });
}

// Create milestones directory (fotos de hitos pinchados en el recorrido)
const milestonesDir = path.join(uploadsDir, 'milestones');
if (!fs.existsSync(milestonesDir)) {
  fs.mkdirSync(milestonesDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, postsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for social media
const socialStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, socialDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen o video'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: fileFilter,
});

// Create multer instance for social media
export const uploadSocial = multer({
  storage: socialStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: fileFilter,
});

// Configure storage for avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

// Create multer instance for avatars
export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: imageFilter,
});

// Configure storage for route cover photos
const routeCoverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, routesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'route-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create multer instance for route cover photos (imagen única, no el track GPS)
export const uploadRouteCover = multer({
  storage: routeCoverStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: imageFilter,
});

// Configure storage for milestone photos
const milestonePhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, milestonesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'milestone-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create multer instance for milestone photos (foto+comentario pinchados en el recorrido)
export const uploadMilestonePhoto = multer({
  storage: milestonePhotoStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: imageFilter,
});

export default upload;
