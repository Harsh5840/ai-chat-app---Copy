import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { authMiddleware } from '../middleware/middleware.js';

const uploadRouter = express.Router();

// Configure multer for memory storage (no disk storage needed)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept images, PDFs, and text files
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|txt|md/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only images, PDFs, and text files are allowed.'));
  },
});

// POST /upload - Upload file to Cloudinary
uploadRouter.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary using buffer
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ai-chat-app', // Organize files in a folder
          resource_type: 'auto', // Auto-detect file type
          public_id: `${Date.now()}-${req.file.originalname}`, // Unique filename
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Write buffer to stream
      uploadStream.end(req.file.buffer);
    });

    // Return the Cloudinary URL
    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      fileName: req.file.originalname,
    });
  } catch (error) {
    console.error('File upload error:', error);
    
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.http_code === 401) {
      return res.status(500).json({ error: 'Cloudinary configuration error. Please check your API credentials.' });
    }

    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// DELETE /upload/:publicId - Delete file from Cloudinary (optional)
uploadRouter.delete('/:publicId', authMiddleware, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    res.json({ 
      message: 'File deleted successfully',
      result 
    });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export { uploadRouter };
