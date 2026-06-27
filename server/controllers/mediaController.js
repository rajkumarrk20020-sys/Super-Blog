const Media = require('../models/Media');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// pure JS helper to get PNG size
const getPngSize = (buffer) => {
  if (buffer.length < 24) return null;
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
};

// pure JS helper to get JPG size
const getJpgSize = (buffer) => {
  let i = 2; // skip SOI marker 0xFFD8
  while (i < buffer.length) {
    if (buffer[i] !== 0xFF) return null;
    const marker = buffer[i + 1];
    if (marker === 0xD9 || marker === 0xDA) break; // SOS or EOI
    const length = buffer.readUInt16BE(i + 2);
    const isSOF = marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC;
    if (isSOF) {
      if (i + 9 >= buffer.length) return null;
      const height = buffer.readUInt16BE(i + 5);
      const width = buffer.readUInt16BE(i + 7);
      return { width, height };
    }
    i += 2 + length;
  }
  return null;
};

// pure JS helper to get WebP size
const getWebpSize = (buffer) => {
  if (buffer.length < 30) return null;
  const chunkType = buffer.toString('ascii', 12, 16);
  if (chunkType === 'VP8X') {
    const width = buffer.readUIntLE(24, 3) + 1;
    const height = buffer.readUIntLE(27, 3) + 1;
    return { width, height };
  } else if (chunkType === 'VP8 ') {
    if (buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a) {
      const width = buffer.readUInt16LE(26) & 0x3fff;
      const height = buffer.readUInt16LE(28) & 0x3fff;
      return { width, height };
    }
  } else if (chunkType === 'VP8L') {
    if (buffer[20] === 0x2f) {
      const bits = buffer.readUInt32LE(21);
      const width = (bits & 0x3FFF) + 1;
      const height = ((bits >> 14) & 0x3FFF) + 1;
      return { width, height };
    }
  }
  return null;
};

const getImageDimensions = (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    if (buffer.length < 4) return null;
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return getPngSize(buffer);
    } else if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      return getJpgSize(buffer);
    } else if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
      return getWebpSize(buffer);
    }
  } catch (err) {
    console.error('Error reading dimensions:', err);
  }
  return null;
};

const getFileHash = (filePath) => {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buffer).digest('hex');
};

// @desc    Upload file
// @route   POST /api/media
// @access  Private (Admin, Author, Editor)
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const filePath = req.file.path;
    const fileHash = getFileHash(filePath);

    // Check duplicate
    const existing = await Media.findOne({ fileHash }).populate('uploadedBy', 'name');
    if (existing) {
      // Remove newly uploaded temp file
      fs.unlinkSync(filePath);
      return res.status(200).json({
        success: true,
        message: 'Duplicate file detected, existing record returned',
        data: existing,
        isDuplicate: true
      });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const dimensions = getImageDimensions(filePath) || { width: null, height: null };

    const media = await Media.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      extension: ext,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      dimensions,
      uploadedBy: req.user._id,
      fileHash
    });

    res.status(201).json({ success: true, data: media });
  } catch (error) {
    // Clean up temp file on failure
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get media files
// @route   GET /api/media
// @access  Private (Admin, Author, Editor)
const getMediaList = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, sortBy } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { filename: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sortBy === 'sizeDesc') {
      sortOption = { fileSize: -1 };
    } else if (sortBy === 'sizeAsc') {
      sortOption = { fileSize: 1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Media.countDocuments(query);

    const mediaList = await Media.find(query)
      .populate('uploadedBy', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: mediaList,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Rename media file
// @route   PUT /api/media/:id/rename
// @access  Private (Admin, Author, Editor)
const renameMedia = async (req, res) => {
  try {
    const { newName } = req.body;
    if (!newName) {
      return res.status(400).json({ success: false, message: 'Please provide new name' });
    }

    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    // Preserve extension
    const ext = path.extname(media.filename);
    let targetFilename = newName.trim();
    if (!targetFilename.endsWith(ext)) {
      targetFilename += ext;
    }

    // Check duplicate filename
    const filenameExists = await Media.findOne({ filename: targetFilename, _id: { $ne: media._id } });
    if (filenameExists) {
      return res.status(400).json({ success: false, message: 'Filename already exists' });
    }

    const oldPath = path.join(__dirname, '../uploads', media.filename);
    const newPath = path.join(__dirname, '../uploads', targetFilename);

    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    }

    media.filename = targetFilename;
    await media.save();

    res.status(200).json({ success: true, message: 'Media renamed successfully', data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete media file
// @route   DELETE /api/media/:id
// @access  Private (Admin, Author, Editor)
const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    const filePath = path.join(__dirname, '../uploads', media.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Media.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk delete media files
// @route   POST /api/media/bulk-delete
// @access  Private (Admin, Author, Editor)
const bulkDeleteMedia = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide array of IDs' });
    }

    const items = await Media.find({ _id: { $in: ids } });
    for (const item of items) {
      const filePath = path.join(__dirname, '../uploads', item.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Media.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ success: true, message: 'Media files bulk deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadFile,
  getMediaList,
  renameMedia,
  deleteMedia,
  bulkDeleteMedia
};
