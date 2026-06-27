const Blog = require('../models/Blog');
const Category = require('../models/Category');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Helper function to generate slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Helper function to calculate reading time
const calculateReadingTime = (htmlContent) => {
  const text = htmlContent.replace(/<[^>]*>/g, ' '); // Strip HTML tags
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(words / 200); // Average reading speed 200 WPM
};

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 6, search, category, status, authorId, showAll, tag, sortBy, startDate, endDate } = req.query;

    const andConditions = [];

    // 1. Category Filter
    if (category) {
      const cat = await Category.findOne({
        $or: [
          { slug: category },
          { _id: typeof category === 'string' && category.match(/^[0-9a-fA-F]{24}$/) ? category : null }
        ].filter(Boolean)
      });
      if (cat) {
        andConditions.push({ category: cat._id });
      } else {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: { page: Number(page), limit: Number(limit), total: 0, pages: 0 }
        });
      }
    }

    // 2. Search filter - Matches Title, Content, Tags, Category Name, and Author Name
    if (search) {
      const matchingCats = await Category.find({ name: { $regex: search, $options: 'i' } }).select('_id');
      const catIds = matchingCats.map(c => c._id);

      const matchingAuthors = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id');
      const authorIds = matchingAuthors.map(u => u._id);

      andConditions.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
          { category: { $in: catIds } },
          { author: { $in: authorIds } }
        ]
      });
    }

    // 3. Tag Filter
    if (tag) {
      andConditions.push({ tags: tag });
    }

    // 4. Date Filter
    if (startDate || endDate) {
      const dateQuery = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);
      andConditions.push({ createdAt: dateQuery });
    }

    // 5. Status and Release Date Filter
    let statusCondition = {};
    if (status) {
      statusCondition = { status };
    } else if (showAll === 'true') {
      if (authorId) {
        andConditions.push({ author: authorId });
      }
    } else {
      if (authorId) {
        andConditions.push({ author: authorId });
      }
      statusCondition = {
        $or: [
          { status: 'Published' },
          { status: 'Scheduled', publishedAt: { $lte: new Date() } }
        ]
      };
    }

    if (Object.keys(statusCondition).length > 0) {
      andConditions.push(statusCondition);
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    // Pagination configurations
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Blog.countDocuments(query);

    // Mongoose Aggregation Pipeline to support "Most Commented" sorting dynamically
    const pipeline = [];

    if (Object.keys(query).length > 0) {
      pipeline.push({ $match: query });
    }

    // Lookup comments count for sorting
    pipeline.push({
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'blogId',
        as: 'comments'
      }
    });

    pipeline.push({
      $addFields: {
        commentCount: { $size: '$comments' }
      }
    });

    // Determine Sort options
    let sortOption = { createdAt: -1 }; // default Newest
    if (sortBy === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sortBy === 'mostViewed') {
      sortOption = { views: -1 };
    } else if (sortBy === 'trending') {
      sortOption = { views: -1, createdAt: -1 };
    } else if (sortBy === 'mostCommented') {
      sortOption = { commentCount: -1, createdAt: -1 };
    }

    pipeline.push({ $sort: sortOption });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: Number(limit) });

    // Populate category and author details
    pipeline.push({
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    });
    pipeline.push({ $unwind: { path: '$category', preserveNullAndEmptyArrays: true } });

    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }
    });
    pipeline.push({ $unwind: { path: '$author', preserveNullAndEmptyArrays: true } });

    // Clean up sensitive author data
    pipeline.push({
      $project: {
        'author.password': 0,
        'author.activityHistory': 0,
        'author.refreshToken': 0,
        'comments': 0
      }
    });

    const blogs = await Blog.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get blog search suggestions
// @route   GET /api/blogs/suggestions
// @access  Public
const getBlogSuggestions = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) {
      return res.status(200).json({ success: true, data: [] });
    }
    const suggestions = await Blog.find({
      status: 'Published',
      title: { $regex: search, $options: 'i' }
    })
      .select('title slug')
      .limit(5);

    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single blog by ID or Slug
// @route   GET /api/blogs/:id
// @access  Public
const getBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { slug: id };

    // Increment views atomically
    const blog = await Blog.findOneAndUpdate(
      query,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('category', 'name slug description')
      .populate('author', 'name email profileImage role socialLinks');

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a blog
// @route   POST /api/blogs
// @access  Private (Admin, Author, Editor)
const createBlog = async (req, res) => {
  try {
    const { title, content, category, status, tags, metaTitle, metaDescription, metaKeywords, publishedAt, isFeatured } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ success: false, message: 'Please add all required fields' });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    let baseSlug = slugify(title);
    let slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    let featuredImage = '';
    if (req.file) {
      featuredImage = `/uploads/${req.file.filename}`;
    }

    let parsedTags = [];
    if (tags) {
      parsedTags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    }

    let parsedKeywords = [];
    if (metaKeywords) {
      parsedKeywords = Array.isArray(metaKeywords) ? metaKeywords : metaKeywords.split(',').map(k => k.trim());
    }

    const readingTime = calculateReadingTime(content);

    const blog = await Blog.create({
      title,
      slug,
      content,
      featuredImage,
      category,
      author: req.user._id,
      status: status || 'Draft',
      tags: parsedTags,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || '',
      metaKeywords: parsedKeywords,
      readingTime,
      publishedAt: status === 'Scheduled' && publishedAt ? new Date(publishedAt) : null,
      isFeatured: isFeatured === 'true' || isFeatured === true
    });

    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin, Author, Editor)
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const isOwner = blog.author.toString() === req.user._id.toString();
    const hasPrivilege = ['Admin', 'Editor'].includes(req.user.role);
    if (!isOwner && !hasPrivilege) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this blog' });
    }

    const { title, content, category, status, tags, metaTitle, metaDescription, metaKeywords, publishedAt, isFeatured } = req.body;

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      blog.category = category;
    }

    if (title) {
      blog.title = title;
      let baseSlug = slugify(title);
      blog.slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    if (content) {
      blog.content = content;
      blog.readingTime = calculateReadingTime(content);
    }

    if (status) {
      blog.status = status;
      if (status === 'Scheduled' && publishedAt) {
        blog.publishedAt = new Date(publishedAt);
      } else if (status !== 'Scheduled') {
        blog.publishedAt = null;
      }
    }

    if (tags) {
      blog.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    }

    if (metaTitle) blog.metaTitle = metaTitle;
    if (metaDescription) blog.metaDescription = metaDescription;
    if (metaKeywords) {
      blog.metaKeywords = Array.isArray(metaKeywords) ? metaKeywords : metaKeywords.split(',').map(k => k.trim());
    }

    if (isFeatured !== undefined) {
      blog.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    if (req.file) {
      if (blog.featuredImage) {
        const oldImagePath = path.join(__dirname, '../', blog.featuredImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      blog.featuredImage = `/uploads/${req.file.filename}`;
    }

    const updatedBlog = await blog.save();
    res.status(200).json({ success: true, data: updatedBlog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private (Admin, Author, Editor)
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const isOwner = blog.author.toString() === req.user._id.toString();
    const hasPrivilege = ['Admin', 'Editor'].includes(req.user.role);
    if (!isOwner && !hasPrivilege) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this blog' });
    }

    if (blog.featuredImage) {
      const imagePath = path.join(__dirname, '../', blog.featuredImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Blog removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBlogs,
  getBlog,
  getBlogSuggestions,
  createBlog,
  updateBlog,
  deleteBlog
};
