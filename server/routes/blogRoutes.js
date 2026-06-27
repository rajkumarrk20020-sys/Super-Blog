const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlog,
  getBlogSuggestions,
  createBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router
  .route('/')
  .get(getBlogs)
  .post(protect, authorize('Admin', 'Author', 'Editor'), upload.single('featuredImage'), createBlog);

router.get('/suggestions', getBlogSuggestions);

router
  .route('/:id')
  .get(getBlog)
  .put(protect, authorize('Admin', 'Author', 'Editor'), upload.single('featuredImage'), updateBlog)
  .delete(protect, authorize('Admin', 'Author', 'Editor'), deleteBlog);

const Blog = require('../models/Blog');

// Add a quick additional route for related blogs
// GET /api/blogs/:id/related
router.get('/:id/related', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    // Fetch 3 blogs with the same category and published status, excluding the current blog
    const relatedBlogs = await Blog.find({
      category: blog.category,
      status: 'Published',
      _id: { $ne: blog._id }
    })
    .populate('author', 'name profileImage')
    .limit(3);

    res.status(200).json({ success: true, data: relatedBlogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
