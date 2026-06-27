const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const User = require('../models/User');

const spamKeywords = ['viagra', 'cialis', 'porn', 'buy-now', 'make-money-fast', 'spamlink', 'free-cash'];

// Simple spam detection helper
const checkSpam = (text) => {
  const lowercaseText = text.toLowerCase();
  const hasSpamKeyword = spamKeywords.some(kw => lowercaseText.includes(kw));
  const urlCount = (lowercaseText.match(/https?:\/\/[^\s]+/g) || []).length;
  return hasSpamKeyword || urlCount > 2;
};

// Helper to update counters
const updateCounters = async (blogId, userId, delta) => {
  try {
    if (blogId) {
      await Blog.findByIdAndUpdate(blogId, { $inc: { commentCount: delta } });
    }
    if (userId) {
      await User.findByIdAndUpdate(userId, { $inc: { commentCount: delta } });
    }
  } catch (err) {
    console.error('Failed to update comment counters:', err);
  }
};

// @desc    Get comments for moderation (Admin only)
// @route   GET /api/comments
// @access  Private/Admin
const getComments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, blogId, userId, sortBy } = req.query;

    const query = {};

    // 1. Search filter (matches comment text)
    if (search) {
      query.comment = { $regex: search, $options: 'i' };
    }

    // 2. Status filter
    if (status) {
      query.status = status;
    }

    // 3. Blog filter
    if (blogId) {
      query.blogId = blogId;
    }

    // 4. User filter
    if (userId) {
      query.userId = userId;
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Comment.countDocuments(query);

    // Sorting options
    let sortOption = { createdAt: -1 }; // default newest
    if (sortBy === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sortBy === 'mostLiked') {
      sortOption = { likeCount: -1, createdAt: -1 };
    } else if (sortBy === 'mostReported') {
      sortOption = { reportCount: -1, createdAt: -1 };
    }

    const comments = await Comment.find(query)
      .populate('userId', 'name email profileImage')
      .populate('blogId', 'title slug')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: comments,
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

// @desc    Get approved comments for a specific blog (including nested structure)
// @route   GET /api/comments/blog/:blogId
// @access  Public
const getBlogComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      blogId: req.params.blogId,
      status: 'Approved',
      isDeleted: false
    })
      .populate('userId', 'name profileImage')
      .sort({ isPinned: -1, createdAt: 1 }) // Pinned first, then oldest first for reading threads
      .lean();

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a comment
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res) => {
  try {
    const { blogId, comment } = req.body;

    if (!blogId || !comment) {
      return res.status(400).json({ success: false, message: 'Please add a comment and blog ID' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const isSpamDetected = checkSpam(comment);
    const status = isSpamDetected ? 'Pending' : 'Approved';

    const newComment = await Comment.create({
      blogId,
      userId: req.user._id,
      comment,
      isSpam: isSpamDetected,
      status,
      replyLevel: 0,
      createdBy: req.user._id
    });

    // Update counters if auto-approved
    if (status === 'Approved') {
      await updateCounters(blogId, req.user._id, 1);
    }

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Post a reply to a comment (supports unlimited nested depth)
// @route   POST /api/comments/:id/reply
// @access  Private
const createCommentReply = async (req, res) => {
  try {
    const { comment } = req.body;
    const parentCommentId = req.params.id;

    if (!comment) {
      return res.status(400).json({ success: false, message: 'Please provide reply text' });
    }

    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      return res.status(404).json({ success: false, message: 'Parent comment not found' });
    }

    const isSpamDetected = checkSpam(comment);
    const status = isSpamDetected ? 'Pending' : 'Approved';
    const nextLevel = (parentComment.replyLevel || 0) + 1;

    const reply = await Comment.create({
      blogId: parentComment.blogId,
      userId: req.user._id,
      comment,
      parentId: parentCommentId,
      replyLevel: nextLevel,
      isSpam: isSpamDetected,
      status,
      createdBy: req.user._id
    });

    // Update counters if auto-approved
    if (status === 'Approved') {
      await updateCounters(parentComment.blogId, req.user._id, 1);
    }

    res.status(201).json({ success: true, data: reply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like/Unlike a comment
// @route   PUT /api/comments/:id/like
// @access  Private
const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Toggle likes
    const likeIndex = comment.likes.indexOf(req.user._id);
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(req.user._id);
    }

    comment.likeCount = comment.likes.length;
    await comment.save();
    
    res.status(200).json({ success: true, likes: comment.likes, likeCount: comment.likeCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Report a comment
// @route   PUT /api/comments/:id/report
// @access  Private
const reportComment = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Please provide a reason for reporting' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const alreadyReported = comment.reports.some(r => r.userId.toString() === req.user._id.toString());
    if (alreadyReported) {
      return res.status(400).json({ success: false, message: 'You have already reported this comment' });
    }

    comment.reports.push({
      userId: req.user._id,
      reason
    });

    comment.reportCount = comment.reports.length;

    // If reported more than 5 times, flag back to Pending and adjust counts if previously Approved
    const oldStatus = comment.status;
    if (comment.reportCount >= 5 && oldStatus === 'Approved') {
      comment.status = 'Pending';
      await updateCounters(comment.blogId, comment.userId, -1);
    }

    await comment.save();
    res.status(200).json({ success: true, message: 'Comment reported successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject comment (Moderate)
// @route   PUT /api/comments/:id/moderate
// @access  Private/Admin
const moderateComment = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const oldStatus = comment.status;
    comment.status = status;
    comment.updatedBy = req.user._id;
    comment.updatedAt = Date.now();
    
    if (status === 'Approved') {
      comment.isSpam = false;
    }

    await comment.save();

    // Adjust counters based on status changes
    if (oldStatus !== 'Approved' && status === 'Approved' && !comment.isDeleted) {
      await updateCounters(comment.blogId, comment.userId, 1);
    } else if (oldStatus === 'Approved' && status !== 'Approved') {
      await updateCounters(comment.blogId, comment.userId, -1);
    }

    res.status(200).json({ success: true, message: `Comment status updated to ${status}`, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Soft Delete comment
// @route   DELETE /api/comments/:id/soft
// @access  Private
const softDeleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const blog = await Blog.findById(comment.blogId);
    const isCommentAuthor = comment.userId.toString() === req.user._id.toString();
    const isBlogOwner = blog && blog.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isCommentAuthor && !isBlogOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    if (comment.isDeleted) {
      return res.status(400).json({ success: false, message: 'Comment is already deleted' });
    }

    comment.isDeleted = true;
    comment.updatedBy = req.user._id;
    comment.updatedAt = Date.now();
    await comment.save();

    // Decrement counters if it was Approved
    if (comment.status === 'Approved') {
      await updateCounters(comment.blogId, comment.userId, -1);
    }

    res.status(200).json({ success: true, message: 'Comment soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore comment
// @route   PUT /api/comments/:id/restore
// @access  Private/Admin
const restoreComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (!comment.isDeleted) {
      return res.status(400).json({ success: false, message: 'Comment is not deleted' });
    }

    comment.isDeleted = false;
    comment.updatedBy = req.user._id;
    comment.updatedAt = Date.now();
    await comment.save();

    // Increment counters if it is Approved
    if (comment.status === 'Approved') {
      await updateCounters(comment.blogId, comment.userId, 1);
    }

    res.status(200).json({ success: true, message: 'Comment restored successfully', data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Pin / Unpin comment
// @route   PUT /api/comments/:id/pin
// @access  Private
const pinComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const blog = await Blog.findById(comment.blogId);
    const isBlogOwner = blog && blog.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isBlogOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the blog owner or admin can pin comments' });
    }

    // Toggle Pin state
    const originalPinState = comment.isPinned;
    
    if (!originalPinState) {
      // Unpin any other comment on this blog first
      await Comment.updateMany({ blogId: comment.blogId, isPinned: true }, { isPinned: false });
    }

    comment.isPinned = !originalPinState;
    comment.updatedBy = req.user._id;
    comment.updatedAt = Date.now();
    await comment.save();

    res.status(200).json({
      success: true,
      message: comment.isPinned ? 'Comment pinned' : 'Comment unpinned',
      data: comment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete comment (Hard delete - Admin only)
// @route   DELETE /api/comments/:id
// @access  Private/Admin
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only admin can hard-delete comments' });
    }

    await Comment.findByIdAndDelete(req.params.id);

    // Decrement counters if the comment was Approved and not previously soft-deleted
    if (comment.status === 'Approved' && !comment.isDeleted) {
      await updateCounters(comment.blogId, comment.userId, -1);
    }

    res.status(200).json({ success: true, message: 'Comment permanently removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
