import crypto from 'crypto';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, uploadDir);
  },
  filename(_req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    const fingerprint = crypto.randomBytes(16).toString('hex').slice(0, 24);

    callback(null, `${file.fieldname}-${fingerprint}${extension}`);
  }
});

function fileFilter(_req, file, callback) {
  const allowedTypesByField = {
    coverImage: ['image/jpeg', 'image/png', 'image/webp'],
    images: ['image/jpeg', 'image/png', 'image/webp'],
    video: ['video/mp4']
  };
  const allowedTypes = allowedTypesByField[file.fieldname] || [];

  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
    return;
  }

  callback(new Error('Unsupported media type'), false);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: (Number(process.env.MAX_VIDEO_SIZE_MB) || 50) * 1024 * 1024
  }
});

export async function optimizeUploadedImages(req, _res, next) {
  try {
    const groups = req.files ? Object.values(req.files).flat() : req.file ? [req.file] : [];

    await Promise.all(
      groups
        .filter((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
        .map(async (file) => {
          const optimizedName = file.filename.replace(path.extname(file.filename), '.webp');
          const optimizedPath = path.join(uploadDir, optimizedName);

          await sharp(file.path)
            .resize({ width: 1600, withoutEnlargement: true })
            .webp({ quality: 82 })
            .toFile(optimizedPath);

          fs.unlinkSync(file.path);
          file.filename = optimizedName;
          file.path = optimizedPath;
          file.mimetype = 'image/webp';
        })
    );

    next();
  } catch (error) {
    next(error);
  }
}
