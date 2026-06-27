const express = require('express');
const router = express.Router();
const {
  getComments,
  getBlogComments,
  createComment,
  createCommentReply,
  likeComment,
  reportComment,
  moderateComment,
  softDeleteComment,
  restoreComment,
  pinComment,
  deleteComment
} = require('../controllers/commentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, createComment)
  .get(protect, authorize('Admin'), getComments);

router.get('/blog/:blogId', getBlogComments);

router
  .route('/:id')
  .put(protect, authorize('Admin'), moderateComment)
  .delete(protect, authorize('Admin'), deleteComment);

router.post('/:id/reply', protect, createCommentReply);
router.put('/:id/like', protect, likeComment);
router.put('/:id/report', protect, reportComment);
router.put('/:id/moderate', protect, authorize('Admin'), moderateComment);
router.delete('/:id/soft', protect, softDeleteComment);
router.put('/:id/restore', protect, authorize('Admin'), restoreComment);
router.put('/:id/pin', protect, pinComment);

module.exports = router;
