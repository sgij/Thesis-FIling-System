import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  uploadFile,
  getFiles,
  getSecureFiles,
  downloadFile,
  accessSecureFile,
  deleteFile,
  deleteSecureFile,
  getFileStats
} from '../controllers/fileController.js';

const router = express.Router();

// All file routes require authentication
router.use(authMiddleware);

// File upload/retrieval routes
router.post('/upload', uploadFile);
router.get('/', getFiles);
router.get('/secure', getSecureFiles);
router.get('/stats', getFileStats);

// File download routes
router.get('/:id/download', downloadFile);

// Secure file access
router.post('/:id/access', accessSecureFile);

// File deletion routes
router.delete('/:id', deleteFile);
router.delete('/secure/:id', deleteSecureFile);

export default router;
