const Blog = require('../models/Blog');
const Category = require('../models/Category');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Contact = require('../models/Contact');
const Media = require('../models/Media');

// Helper to get last 6 months range
const getSixMonthsRange = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 5);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Map month number to label
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Admin, Author, Editor)
const getDashboardStats = async (req, res) => {
  try {
    const isAdminOrEditor = ['Admin', 'Editor'].includes(req.user.role);
    
    // 1. Basic Stats Counting
    let totalBlogs = 0;
    let publishedBlogs = 0;
    let draftBlogs = 0;
    let totalComments = 0;
    let pendingComments = 0;
    let totalMedia = 0;
    let blogIds = [];

    if (isAdminOrEditor) {
      totalBlogs = await Blog.countDocuments({});
      publishedBlogs = await Blog.countDocuments({ status: 'Published' });
      draftBlogs = await Blog.countDocuments({ status: 'Draft' });
      totalComments = await Comment.countDocuments({});
      pendingComments = await Comment.countDocuments({ status: 'Pending' });
      totalMedia = await Media.countDocuments({});
    } else {
      // Author only sees their own stats
      totalBlogs = await Blog.countDocuments({ author: req.user._id });
      publishedBlogs = await Blog.countDocuments({ author: req.user._id, status: 'Published' });
      draftBlogs = await Blog.countDocuments({ author: req.user._id, status: 'Draft' });
      totalMedia = await Media.countDocuments({ uploadedBy: req.user._id });
      
      const authorBlogs = await Blog.find({ author: req.user._id }).select('_id');
      blogIds = authorBlogs.map(b => b._id);
      totalComments = await Comment.countDocuments({ blogId: { $in: blogIds } });
      pendingComments = await Comment.countDocuments({ blogId: { $in: blogIds }, status: 'Pending' });
    }

    const totalCategories = await Category.countDocuments({});
    
    // User metrics (Admins/Editors only)
    const totalUsers = isAdminOrEditor ? await User.countDocuments({}) : 0;
    const totalAuthors = isAdminOrEditor ? await User.countDocuments({ role: 'Author' }) : 0;
    const totalEditors = isAdminOrEditor ? await User.countDocuments({ role: 'Editor' }) : 0;
    const totalVisitors = isAdminOrEditor ? await User.countDocuments({ role: 'Visitor' }) : 0;

    // Contact messages (Admins/Editors only)
    const contactMessages = isAdminOrEditor ? await Contact.countDocuments({}) : 0;

    // 2. Analytical Charts Aggregation (Last 6 Months)
    const sixMonthsAgo = getSixMonthsRange();

    // A. Monthly Blogs count
    const monthlyBlogsRaw = await Blog.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // B. Monthly Users count
    const monthlyUsersRaw = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // C. Monthly Views count
    const monthlyViewsRaw = await Blog.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: "$views" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format monthly counts to a standard line list for charts
    const monthlyBlogs = [];
    const monthlyUsers = [];
    const monthlyViews = [];

    // Loop through past 6 months to ensure zero-filled values if no items are created
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const monthLabel = `${monthNames[m - 1]} ${y.toString().slice(-2)}`;

      const blogMatch = monthlyBlogsRaw.find(b => b._id.month === m && b._id.year === y);
      const userMatch = monthlyUsersRaw.find(u => u._id.month === m && u._id.year === y);
      const viewMatch = monthlyViewsRaw.find(v => v._id.month === m && v._id.year === y);

      monthlyBlogs.push({ label: monthLabel, count: blogMatch ? blogMatch.count : 0 });
      monthlyUsers.push({ label: monthLabel, count: userMatch ? userMatch.count : 0 });
      monthlyViews.push({ label: monthLabel, count: viewMatch ? viewMatch.count : 0 });
    }

    // D. Top Categories
    const topCategories = await Blog.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$categoryInfo.name', 'Uncategorized'] },
          count: 1
        }
      }
    ]);

    // E. Top Authors
    const activeAuthors = await Blog.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'authorInfo'
        }
      },
      { $unwind: { path: '$authorInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$authorInfo.name', 'Unknown Author'] },
          count: 1
        }
      }
    ]);

    // F. Most Viewed Blogs
    const mostViewedBlogs = isAdminOrEditor
      ? await Blog.find({}).sort({ views: -1 }).limit(5).populate('author', 'name').populate('category', 'name').lean()
      : await Blog.find({ author: req.user._id }).sort({ views: -1 }).limit(5).populate('author', 'name').populate('category', 'name').lean();

    // G. Most Commented Blogs
    const mostCommentedBlogs = isAdminOrEditor
      ? await Blog.find({}).sort({ commentCount: -1 }).limit(5).populate('author', 'name').populate('category', 'name').lean()
      : await Blog.find({ author: req.user._id }).sort({ commentCount: -1 }).limit(5).populate('author', 'name').populate('category', 'name').lean();

    // H. Latest Users (Admins/Editors only)
    const latestUsers = isAdminOrEditor
      ? await User.find({}).sort({ createdAt: -1 }).limit(5).select('name email role createdAt').lean()
      : [];

    // I. Latest Comments
    const latestComments = isAdminOrEditor
      ? await Comment.find({}).sort({ createdAt: -1 }).limit(5).populate('userId', 'name').populate('blogId', 'title').lean()
      : await Comment.find({ blogId: { $in: blogIds } }).sort({ createdAt: -1 }).limit(5).populate('userId', 'name').populate('blogId', 'title').lean();

    // 3. Recent Activities Timeline
    const recentBlogs = isAdminOrEditor
      ? await Blog.find({}).sort({ createdAt: -1 }).limit(5).populate('author', 'name')
      : await Blog.find({ author: req.user._id }).sort({ createdAt: -1 }).limit(5).populate('author', 'name');

    const recentComments = isAdminOrEditor
      ? await Comment.find({}).sort({ createdAt: -1 }).limit(5).populate('userId', 'name').populate('blogId', 'title')
      : await Comment.find({}).sort({ createdAt: -1 }).limit(10).populate('userId', 'name').populate('blogId', 'title');

    // Filter author's comments if not admin
    let filteredComments = recentComments;
    if (!isAdminOrEditor) {
      filteredComments = recentComments.filter(c => c.blogId && blogIds.some(id => id.toString() === c.blogId._id.toString())).slice(0, 5);
    }

    const recentInquiries = isAdminOrEditor ? await Contact.find({}).sort({ createdAt: -1 }).limit(5) : [];

    // Map to custom activity object
    const timeline = [];

    recentBlogs.forEach(b => {
      timeline.push({
        type: 'blog',
        message: `Blog created: "${b.title}" by ${b.author?.name || 'Author'}`,
        timestamp: b.createdAt
      });
    });

    filteredComments.forEach(c => {
      timeline.push({
        type: 'comment',
        message: `New comment left by ${c.userId?.name || 'Visitor'} on "${c.blogId?.title || 'Article'}"`,
        timestamp: c.createdAt
      });
    });

    recentInquiries.forEach(i => {
      timeline.push({
        type: 'inquiry',
        message: `Support message received from ${i.name} ("${i.subject}")`,
        timestamp: i.createdAt
      });
    });

    // Sort combined timeline by date desc
    const sortedTimeline = timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          totalBlogs,
          publishedBlogs,
          draftBlogs,
          totalCategories,
          totalUsers,
          totalAuthors,
          totalEditors,
          totalVisitors,
          totalComments,
          pendingComments,
          contactMessages,
          totalMedia
        },
        charts: {
          monthlyBlogs,
          monthlyUsers,
          monthlyViews,
          topCategories,
          activeAuthors
        },
        mostViewedBlogs,
        mostCommentedBlogs,
        latestUsers,
        latestComments,
        timeline: sortedTimeline
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats
};
