import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import BlogCard from '../components/BlogCard';

const AuthorProfile = () => {
  const { id } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [authorInfo, setAuthorInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorBlogs = async () => {
      try {
        setLoading(true);
        // Query blogs where author is this id and status is Published
        const res = await axios.get(`/api/blogs?authorId=${id}&status=Published`);
        if (res.data.success) {
          setBlogs(res.data.data);
          
          if (res.data.data.length > 0) {
            // Extract author info from the first blog
            setAuthorInfo(res.data.data[0].author);
          } else {
            // Fallback mock author if they have no published blogs yet
            setAuthorInfo({
              name: 'Creative Author',
              email: 'author@smartblog.com',
              profileImage: '',
              role: 'Author'
            });
          }
        }
      } catch (err) {
        console.error('Error fetching author blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAuthorBlogs();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading author profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <section className="author-hero rounded-4 overflow-hidden shadow-sm mb-5 position-relative">
        <div className="author-banner bg-dark position-relative" style={{ minHeight: '260px' }}>
          <div className="author-banner-overlay"></div>
        </div>
        <div className="author-hero-content container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-end gy-4">
            <div className="col-md-3 text-center text-md-start">
              {authorInfo?.profileImage ? (
                <img
                  src={authorInfo.profileImage}
                  alt={authorInfo.name}
                  className="rounded-circle border border-4 border-white shadow-lg"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              ) : (
                <div className="rounded-circle bg-white text-dark d-inline-flex align-items-center justify-content-center fw-extrabold shadow-lg" style={{ width: '150px', height: '150px', fontSize: '64px' }}>
                  {authorInfo?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="col-md-9 text-center text-md-start">
              <span className="badge bg-white text-dark mb-3 rounded-pill px-3 py-2 text-uppercase fw-semibold">{authorInfo?.role || 'Author'}</span>
              <h1 className="fw-bold display-6 mb-2 text-white">{authorInfo?.name}</h1>
              <p className="text-white-70 mb-3"><i className="bi bi-envelope-fill me-2"></i>{authorInfo?.email}</p>
              <p className="text-white-70 mb-0" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                Welcome to my profile page! I write about technology, startups, development frameworks, and workflows. Read my articles below and leave a comment to share your insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="row gx-5">
        <div className="col-lg-8">
          <div className="author-stats-grid row g-3 mb-5">
            <div className="col-sm-4">
              <div className="stat-card rounded-4 p-4 bg-white shadow-sm h-100">
                <p className="text-uppercase text-secondary small mb-2">Articles</p>
                <h3 className="fw-bold mb-0">{blogs.length}</h3>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="stat-card rounded-4 p-4 bg-white shadow-sm h-100">
                <p className="text-uppercase text-secondary small mb-2">Views</p>
                <h3 className="fw-bold mb-0">{blogs.reduce((sum, blog) => sum + (blog.views || 0), 0)}</h3>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="stat-card rounded-4 p-4 bg-white shadow-sm h-100">
                <p className="text-uppercase text-secondary small mb-2">Followers</p>
                <h3 className="fw-bold mb-0">1.2k</h3>
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
            <button type="button" className="btn btn-premium-primary rounded-pill px-4 py-2">Follow</button>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary rounded-circle social-btn" aria-label="Twitter"><i className="bi bi-twitter-x"></i></button>
              <button className="btn btn-outline-secondary rounded-circle social-btn" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></button>
              <button className="btn btn-outline-secondary rounded-circle social-btn" aria-label="GitHub"><i className="bi bi-github"></i></button>
            </div>
          </div>

          <div className="author-articles-list row g-4">
            {blogs.length > 0 ? blogs.map((blog) => (
              <div key={blog._id} className="col-12">
                <div className="author-article-card rounded-4 bg-white shadow-sm overflow-hidden d-flex flex-column flex-md-row gap-4">
                  <div className="author-article-image flex-shrink-0 overflow-hidden rounded-4" style={{ minWidth: '220px', minHeight: '180px' }}>
                    {blog.featuredImage ? (
                      <img src={blog.featuredImage} alt={blog.title} className="w-100 h-100 object-cover" loading="lazy" />
                    ) : (
                      <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white">
                        <i className="bi bi-image fs-2"></i>
                      </div>
                    )}
                  </div>
                  <div className="p-4 d-flex flex-column justify-content-between">
                    <div>
                      <span className="category-pill mb-3">{blog.category?.name || 'Uncategorized'}</span>
                      <h3 className="fw-bold mb-3 line-clamp-2">
                        <Link to={`/blogs/${blog.slug}`} className="text-dark text-decoration-none hover-primary">{blog.title}</Link>
                      </h3>
                      <p className="text-muted mb-4 line-clamp-3">{blog.excerpt || blog.content?.replace(/<[^>]+>/g, '').slice(0, 140) + '...'}</p>
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-3 text-muted small">
                      <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>{blog.readingTime || 1} min read</span>
                      <span><i className="bi bi-eye-fill"></i> {blog.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-12">
                <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                  <i className="bi bi-journal-x fs-1 text-muted d-block mb-3"></i>
                  <h5>No published articles yet</h5>
                  <p className="text-muted">Check back later to see posts from this author.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorProfile;
