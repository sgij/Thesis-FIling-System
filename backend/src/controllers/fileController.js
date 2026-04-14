import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Upload a new file
 * POST /api/files/upload
 */
export const uploadFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, size, mimeType, contentBase64, isEncrypted } = req.body;

    // Validate required fields
    if (!name || !mimeType || !contentBase64) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, mimeType, contentBase64'
      });
    }

    if (isEncrypted) {
      // Store as SecureFile
      const secureFile = await prisma.secureFile.create({
        data: {
          userId,
          name,
          type: type || 'unknown',
          size: BigInt(size || 0),
          mimeType,
          encryptedContent: contentBase64,
          encrypted: true,
          iv: req.body.iv || '',
          salt: req.body.salt || ''
        }
      });

      // Log the activity
      await prisma.activityLog.create({
        data: {
          userId,
          type: 'upload',
          description: `Uploaded encrypted file: ${name}`
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Encrypted file uploaded successfully',
        file: {
          id: secureFile.id,
          name: secureFile.name,
          size: secureFile.size.toString(),
          uploadedAt: secureFile.uploadedAt
        }
      });
    } else {
      // Store as regular File
      const file = await prisma.file.create({
        data: {
          userId,
          name,
          type: type || 'unknown',
          size: BigInt(size || 0),
          mimeType,
          contentBase64
        }
      });

      // Log the activity
      await prisma.activityLog.create({
        data: {
          userId,
          type: 'upload',
          description: `Uploaded file: ${name}`
        }
      });

      return res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        file: {
          id: file.id,
          name: file.name,
          size: file.size.toString(),
          uploadedAt: file.uploadedAt
        }
      });
    }
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: 'File upload failed',
      details: error.message
    });
  }
};

/**
 * Get all files for authenticated user
 * GET /api/files
 */
export const getFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, sortBy } = req.query;

    let files = await prisma.file.findMany({
      where: {
        userId,
        deletedAt: null // Exclude soft-deleted files
      },
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        mimeType: true,
        uploadedAt: true
      }
    });

    // Filter by type if specified
    if (type) {
      files = files.filter(f => f.type === type);
    }

    // Sort
    if (sortBy === 'name') {
      files.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'size') {
      files.sort((a, b) => Number(b.size) - Number(a.size));
    } else {
      // Default: sort by date (newest first)
      files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    }

    res.json({
      success: true,
      count: files.length,
      files
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve files',
      details: error.message
    });
  }
};

/**
 * Get secure files for authenticated user
 * GET /api/files/secure
 */
export const getSecureFiles = async (req, res) => {
  try {
    const userId = req.user.id;

    const secureFiles = await prisma.secureFile.findMany({
      where: {
        userId,
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        mimeType: true,
        uploadedAt: true,
        encrypted: true
      }
    });

    res.json({
      success: true,
      count: secureFiles.length,
      files: secureFiles
    });
  } catch (error) {
    console.error('Get secure files error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve secure files',
      details: error.message
    });
  }
};

/**
 * Download a file
 * GET /api/files/:id/download
 */
export const downloadFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const file = await prisma.file.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId,
        type: 'download',
        description: `Downloaded file: ${file.name}`
      }
    });

    res.json({
      success: true,
      file: {
        id: file.id,
        name: file.name,
        content: file.contentBase64,
        mimeType: file.mimeType,
        size: file.size.toString()
      }
    });
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({
      success: false,
      error: 'File download failed',
      details: error.message
    });
  }
};

/**
 * Access a secure file (requires password verification)
 * POST /api/files/:id/access
 */
export const accessSecureFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password required'
      });
    }

    const secureFile = await prisma.secureFile.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      }
    });

    if (!secureFile) {
      return res.status(404).json({
        success: false,
        error: 'Secure file not found'
      });
    }

    // Note: Password verification should be implemented with your encryption method
    // This is a placeholder - implement actual decryption/verification logic

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId,
        type: 'access',
        description: `Accessed secure file: ${secureFile.name}`
      }
    });

    res.json({
      success: true,
      file: {
        id: secureFile.id,
        name: secureFile.name,
        content: secureFile.encryptedContent,
        mimeType: secureFile.mimeType,
        size: secureFile.size.toString()
      }
    });
  } catch (error) {
    console.error('Secure file access error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to access secure file',
      details: error.message
    });
  }
};

/**
 * Delete a file (soft delete)
 * DELETE /api/files/:id
 */
export const deleteFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const file = await prisma.file.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Soft delete
    const deletedFile = await prisma.file.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId,
        type: 'delete',
        description: `Deleted file: ${file.name}`
      }
    });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({
      success: false,
      error: 'File deletion failed',
      details: error.message
    });
  }
};

/**
 * Delete a secure file
 * DELETE /api/files/secure/:id
 */
export const deleteSecureFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const secureFile = await prisma.secureFile.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      }
    });

    if (!secureFile) {
      return res.status(404).json({
        success: false,
        error: 'Secure file not found'
      });
    }

    // Soft delete
    const deletedFile = await prisma.secureFile.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId,
        type: 'delete',
        description: `Deleted secure file: ${secureFile.name}`
      }
    });

    res.json({
      success: true,
      message: 'Secure file deleted successfully'
    });
  } catch (error) {
    console.error('Secure file delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Secure file deletion failed',
      details: error.message
    });
  }
};

/**
 * Get file statistics
 * GET /api/files/stats
 */
export const getFileStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalFiles = await prisma.file.count({
      where: { userId, deletedAt: null }
    });

    const secureFiles = await prisma.secureFile.count({
      where: { userId, deletedAt: null }
    });

    const allFiles = await prisma.file.findMany({
      where: { userId, deletedAt: null },
      select: { size: true }
    });

    const allSecureFiles = await prisma.secureFile.findMany({
      where: { userId, deletedAt: null },
      select: { size: true }
    });

    const totalSize = [
      ...allFiles.map(f => Number(f.size)),
      ...allSecureFiles.map(f => Number(f.size))
    ].reduce((sum, size) => sum + size, 0);

    res.json({
      success: true,
      stats: {
        totalFiles,
        secureFiles,
        totalSize,
        totalSizeFormatted: formatBytes(totalSize)
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics',
      details: error.message
    });
  }
};

// Helper function to format bytes
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
