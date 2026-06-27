const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Category = require('../models/Category');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const Contact = require('../models/Contact');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in the environment');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('Database connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Blog.deleteMany({});
    await Comment.deleteMany({});
    await Contact.deleteMany({});
    console.log('Existing collections cleared...');

    // 1. Seed Users
    const adminUser = new User({
      name: 'System Admin',
      email: 'admin@smartblog.com',
      password: 'admin123',
      role: 'Admin',
      profileImage: '',
      bio: 'Principal Architect and System Administrator of the SmartBlog platform.',
      socialLinks: {
        facebook: 'https://facebook.com/admin',
        twitter: 'https://twitter.com/admin',
        linkedin: 'https://linkedin.com/in/admin',
        github: 'https://github.com/admin'
      },
      activityHistory: [{ action: 'Registered Account' }, { action: 'Seeded Platform Database' }]
    });
    await adminUser.save();

    const authorUser = new User({
      name: 'John Author',
      email: 'author@smartblog.com',
      password: 'author123',
      role: 'Author',
      profileImage: '',
      bio: 'Technical writer and expert software engineer specializing in backend systems.',
      socialLinks: {
        facebook: '',
        twitter: 'https://twitter.com/john_author',
        linkedin: 'https://linkedin.com/in/john_author',
        github: 'https://github.com/john_author'
      },
      activityHistory: [{ action: 'Registered Account' }]
    });
    await authorUser.save();

    const editorUser = new User({
      name: 'Sarah Editor',
      email: 'editor@smartblog.com',
      password: 'editor123',
      role: 'Editor',
      profileImage: '',
      bio: 'Senior Content Editor responsible for verifying grammar, flow, and formatting of posts.',
      socialLinks: {
        facebook: '',
        twitter: '',
        linkedin: 'https://linkedin.com/in/sarah_editor',
        github: ''
      },
      activityHistory: [{ action: 'Registered Account' }]
    });
    await editorUser.save();

    const visitorUser = new User({
      name: 'Jane Visitor',
      email: 'visitor@smartblog.com',
      password: 'visitor123',
      role: 'Visitor',
      profileImage: '',
      bio: 'Avid reader and tech enthusiast.',
      activityHistory: [{ action: 'Registered Account' }]
    });
    await visitorUser.save();

    console.log('Users seeded...');

    // 2. Seed Categories
    const techCategory = await Category.create({
      name: 'Technology',
      slug: 'technology',
      description: 'Latest trends, coding tutorials, and software reviews.'
    });

    const lifestyleCategory = await Category.create({
      name: 'Lifestyle',
      slug: 'lifestyle',
      description: 'Healthy habits, personal growth, travel, and daily hacks.'
    });

    const businessCategory = await Category.create({
      name: 'Business',
      slug: 'business',
      description: 'Startups, financial planning, marketing, and corporate insights.'
    });

    console.log('Categories seeded...');

    // 3. Seed Blogs
    const techBlog = await Blog.create({
      title: 'The Future of AI and Agentic Coding',
      slug: 'the-future-of-ai-and-agentic-coding-9812',
      content: '<p>Artificial Intelligence is transforming how software is written. In this post, we discuss the evolution of LLMs from simple completions to full-fledged autonomous coding agents. Autonomous agents can plan, write tests, modify codebases, and compile files under human guidance.</p><p>As these tools become more robust, developers can focus on higher-level system architecture and user experience design rather than boilerplate code.</p>',
      featuredImage: '',
      category: techCategory._id,
      author: adminUser._id,
      status: 'Published',
      views: 120,
      tags: ['AI', 'Coding', 'Technology'],
      metaTitle: 'AI and Agentic Coding Future Trends',
      metaDescription: 'An article explaining how autonomous agentic coding systems are transforming modern software development.',
      metaKeywords: ['ai', 'agentic coding', 'llms', 'programming'],
      readingTime: 2,
      isFeatured: true
    });

    const lifestyleBlog = await Blog.create({
      title: '10 Minimalist Habits for a Better Work-Life Balance',
      slug: '10-minimalist-habits-for-a-better-work-life-balance-4122',
      content: '<p>Minimalism is not just about decluttering physical spaces; it is a philosophy of simplicity that helps us reclaim mental clarity.</p><ol><li>Limit digital notifications.</li><li>Create a dedicated workspace.</li><li>Say no to non-essential commitments.</li><li>Focus on single-tasking.</li></ol><p>Implementing these simple habits can dramatically reduce stress and improve daily productivity.</p>',
      featuredImage: '',
      category: lifestyleCategory._id,
      author: authorUser._id,
      status: 'Published',
      views: 85,
      tags: ['Minimalism', 'Productivity', 'Lifestyle'],
      metaTitle: '10 Minimalist Habits for Better Work Life Balance',
      metaDescription: 'Learn how simple minimalist habits can help reduce work stress and improve your productivity.',
      metaKeywords: ['minimalism', 'work life', 'habits', 'stress-relief'],
      readingTime: 2,
      isFeatured: false
    });

    const draftBlog = await Blog.create({
      title: 'Unpublished Ideas and Insights',
      slug: 'unpublished-ideas-and-insights-7128',
      content: '<p>This is a draft post. Visitors should not see this on the website unless they are the author or system administrator.</p>',
      featuredImage: '',
      category: businessCategory._id,
      author: authorUser._id,
      status: 'Draft',
      views: 0,
      tags: ['Draft', 'Ideas'],
      metaTitle: 'Unpublished draft notes',
      metaDescription: 'Author scratchpad notes.',
      readingTime: 1,
      isFeatured: false
    });

    const scheduledBlog = await Blog.create({
      title: 'Upcoming Tech Trends for Next Year',
      slug: 'upcoming-tech-trends-for-next-year-5531',
      content: '<p>This post is scheduled for future release. It will automatically show up when the scheduled date has passed.</p>',
      featuredImage: '',
      category: techCategory._id,
      author: authorUser._id,
      status: 'Scheduled',
      views: 0,
      tags: ['Tech', 'Future'],
      metaTitle: 'Upcoming Tech Trends',
      metaDescription: 'Future release post.',
      readingTime: 1,
      publishedAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      isFeatured: false
    });

    console.log('Blogs seeded...');

    // 4. Seed Comments
    const comment1 = await Comment.create({
      blogId: techBlog._id,
      userId: visitorUser._id,
      comment: 'Excellent article! The transition to agentic coding is happening faster than we think.',
      status: 'Approved'
    });

    await Comment.create({
      blogId: techBlog._id,
      userId: authorUser._id,
      comment: 'Agreed, the productivity gains are already noticeable.',
      status: 'Approved',
      parentId: comment1._id
    });

    await Comment.create({
      blogId: lifestyleBlog._id,
      userId: visitorUser._id,
      comment: 'This minimalist guide is exactly what I needed today. Digital detox is super important.',
      status: 'Pending'
    });

    console.log('Comments seeded...');

    // Update cached commentCount fields
    await Blog.findByIdAndUpdate(techBlog._id, { commentCount: 2 });
    await User.findByIdAndUpdate(visitorUser._id, { commentCount: 1 });
    await User.findByIdAndUpdate(authorUser._id, { commentCount: 1 });

    // 5. Seed Contact inquiries
    await Contact.create({
      name: 'Michael Smith',
      email: 'michael@test.com',
      subject: 'Partnership Inquiry',
      message: 'Hello, I love your blog platform and want to discuss content partnership opportunities.',
      replyStatus: 'Unread'
    });

    console.log('Seed data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
