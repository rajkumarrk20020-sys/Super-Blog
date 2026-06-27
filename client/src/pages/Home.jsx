import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import BlogCard from '../components/BlogCard';
import FeaturedBlog from '../components/FeaturedBlog';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch published blogs (max 6)
        const blogsRes = await api.get('/blogs?limit=6&status=Published');
        if (blogsRes.data.success) {
          setBlogs(blogsRes.data.data);
        }

        // Fetch trending blogs (sorted by views)
        const trendingRes = await api.get('/blogs?limit=3&status=Published&sortBy=trending');
        if (trendingRes.data.success) {
          setTrending(trendingRes.data.data);
        }

        // Fetch categories
        const categoriesRes = await api.get('/categories');
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Find featured blog in our list, fallback to first blog
  const featured = blogs.find(b => b.isFeatured) || blogs[0] || null;
  // Filter out the featured blog from the latest posts list
  const latest = blogs.filter(b => b._id !== featured?._id).slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="py-5 bg-white border-bottom shadow-sm">
        <div className="container py-5 text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <span className="badge bg-primary rounded-pill py-2 px-3 fw-bold mb-3 text-uppercase tracking-wider">
                Unleash Your Voice
              </span>
              <h1 className="display-3 fw-extrabold mb-4">
                Discover Stories & Ideas on <span className="text-gradient">SmartBlog</span>
              </h1>
              <p className="lead text-muted mb-5 px-lg-5">
                Join our role-based blogging platform to write, read, and discuss cutting-edge concepts in software engineering, startup strategies, and personal growth.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/blogs" className="btn btn-premium-primary btn-lg px-4 rounded-pill">
                  Explore Blogs <i className="bi bi-compass ms-2"></i>
                </Link>
                <Link to="/register" className="btn btn-outline-secondary btn-lg px-4 rounded-pill border-2">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-5">
        {loading ? (
          <div className="d-flex flex-column gap-5 py-5">
            {/* Skeleton Hero */}
            <div className="skeleton" style={{ width: '100%', height: '350px', borderRadius: '24px' }}></div>
            {/* Skeleton Cards */}
            <div className="row g-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="col-md-4">
                  <div className="skeleton" style={{ width: '100%', height: '380px', borderRadius: '16px' }}></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Featured Blog */}
            {featured && (
              <div>
                <h3 className="fw-bold mb-4"><i className="bi bi-star-fill text-warning me-2"></i> Featured Article</h3>
                <FeaturedBlog blog={featured} />
              </div>
            )}

            {/* Trending Blogs Section */}
            {trending.length > 0 && (
              <div className="my-5 pt-4">
                <h3 className="fw-bold mb-4"><i className="bi bi-graph-up-arrow text-primary me-2"></i> Trending Articles</h3>
                <div className="row g-4">
                  {trending.map((blog) => (
                    <div key={blog._id} className="col-md-4">
                      <BlogCard blog={blog} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Latest Blogs Section */}
            {latest.length > 0 && (
              <div className="mt-5 pt-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h3 className="fw-bold mb-0"><i className="bi bi-clock-fill text-secondary me-2"></i> Recently Added</h3>
                  <Link to="/blogs" className="text-primary fw-bold text-decoration-none">
                    View All <i className="bi bi-chevron-right"></i>
                  </Link>
                </div>
                <div className="row g-4">
                  {latest.map((blog) => (
                    <div key={blog._id} className="col-md-4">
                      <BlogCard blog={blog} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Grid */}
            {categories.length > 0 && (
              <div className="mt-5 pt-5 border-top">
                <h3 className="fw-bold text-center mb-2">Popular Categories</h3>
                <p className="text-muted text-center mb-5">Explore topics that matter to you</p>
                <div className="row g-4 justify-content-center">
                  {categories.map((cat) => (
                    <div key={cat._id} className="col-6 col-md-3 col-lg-2">
                      <Link
                        to={`/blogs?category=${cat.slug}`}
                        className="card h-100 text-center p-4 border-0 shadow-sm rounded-4 text-decoration-none text-dark hover-primary"
                        style={{ transition: 'all 0.3s' }}
                      >
                        <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3 mx-auto" style={{ width: '60px', height: '60px' }}>
                          <i className="bi bi-tag-fill text-primary fs-4"></i>
                        </div>
                        <h6 className="fw-bold mb-0">{cat.name}</h6>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
