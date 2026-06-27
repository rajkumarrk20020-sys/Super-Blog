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
      {/* Author Bio Card */}
      <div className="card border-0 shadow-sm p-5 rounded-4 mb-5 text-center text-md-start bg-white">
        <div className="row align-items-center">
          <div className="col-md-3 text-center mb-4 mb-md-0">
            {authorInfo?.profileImage ? (
              <img
                src={authorInfo.profileImage}
                alt={authorInfo.name}
                className="rounded-circle border border-4 border-primary shadow-sm"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
            ) : (
              <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-extrabold shadow-sm" style={{ width: '150px', height: '150px', fontSize: '64px' }}>
                {authorInfo?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="col-md-9">
            <span className="badge bg-secondary mb-2 rounded-pill px-3 py-2 text-uppercase">{authorInfo?.role || 'Author'}</span>
            <h1 className="fw-bold mb-2">{authorInfo?.name}</h1>
            <p className="text-muted mb-3"><i className="bi bi-envelope-fill me-2"></i> {authorInfo?.email}</p>
            <p className="mb-0 text-secondary" style={{ fontSize: '16px', lineHeight: '1.6' }}>
              Welcome to my profile page! I write about technology, startups, development frameworks, and workflows. Read my articles below and leave a comment to share your insights.
            </p>
          </div>
        </div>
      </div>

      {/* Author Blogs list */}
      <div>
        <h3 className="fw-bold mb-4">Articles by {authorInfo?.name} ({blogs.length})</h3>
        {blogs.length > 0 ? (
          <div className="row g-4">
            {blogs.map((blog) => (
              <div key={blog._id} className="col-md-4">
                <BlogCard blog={blog} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm">
            <i className="bi bi-journal-x fs-1 text-muted d-block mb-3"></i>
            <h5>No published articles yet</h5>
            <p className="text-muted">Check back later to see posts from this author.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorProfile;
