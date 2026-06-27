const express = require('express');
const router = express.Router();
const {
  uploadFile,
  getMediaList,
  renameMedia,
  deleteMedia,
  bulkDeleteMedia
} = require('../controllers/mediaController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);
router.use(authorize('Admin', 'Author', 'Editor'));

router
  .route('/')
  .get(getMediaList)
  .post(upload.single('file'), uploadFile);

router.post('/bulk-delete', bulkDeleteMedia);

router
  .route('/:id')
  .delete(deleteMedia);

router.put('/:id/rename', renameMedia);

module.exports = router;
