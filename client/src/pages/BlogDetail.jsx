import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import CommentSection from '../components/CommentSection';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch blog by slug or ID
        const res = await axios.get(`/api/blogs/${slug}`);
        if (res.data.success) {
          const fetchedBlog = res.data.data;
          setBlog(fetchedBlog);
          
          // Dynamic SEO Injection
          document.title = fetchedBlog.metaTitle || fetchedBlog.title;
          
          // Set meta description dynamically
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.getElementsByTagName('head')[0].appendChild(metaDesc);
          }
          metaDesc.content = fetchedBlog.metaDescription || '';

          // Set meta keywords dynamically
          let metaKey = document.querySelector('meta[name="keywords"]');
          if (!metaKey) {
            metaKey = document.createElement('meta');
            metaKey.name = 'keywords';
            document.getElementsByTagName('head')[0].appendChild(metaKey);
          }
          metaKey.content = fetchedBlog.metaKeywords ? fetchedBlog.metaKeywords.join(', ') : '';

          // Fetch related blogs in the same category
          const relatedRes = await axios.get(`/api/blogs/${fetchedBlog._id}/related`);
          if (relatedRes.data.success) {
            setRelated(relatedRes.data.data);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Blog not found.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlogData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-5 my-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading blog...</span>
            </div>
            <p className="text-muted">Loading article details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container py-5 my-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center">
            <i className="bi bi-exclamation-triangle-fill text-warning fs-1 d-block mb-3"></i>
            <h3>Oops! Article Not Found</h3>
            <p className="text-muted">{error || 'The blog post you are looking for does not exist.'}</p>
            <Link to="/blogs" className="btn btn-primary mt-3">
              Back to Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        
        {/* Main Content Area */}
        <div className="col-lg-8">
          {/* Breadcrumb / Category */}
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-4">
              <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
              <li className="breadcrumb-item"><Link to="/blogs" className="text-decoration-none">Blogs</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{blog.category?.name}</li>
            </ol>
          </nav>

          {/* Title */}
          <h1 className="display-5 fw-extrabold mb-4">{blog.title}</h1>

          {/* Author info & Metadata */}
          <div className="d-flex align-items-center justify-content-between border-top border-bottom py-3 mb-4">
            <div className="d-flex align-items-center gap-3">
              {blog.author?.profileImage ? (
                <img
                  src={blog.author.profileImage}
                  alt={blog.author.name}
                  className="rounded-circle"
                  style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                />
              ) : (
                <div className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '48px', height: '48px' }}>
                  {blog.author?.name ? blog.author.name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <div>
                <span className="d-block fw-bold text-dark">
                  By <Link to={`/author/${blog.author?._id}`} className="text-decoration-none text-dark hover-primary">{blog.author?.name || 'Deleted User'}</Link>
                </span>
                <span className="text-muted" style={{ fontSize: '13px' }}>
                  Published on {formattedDate}
                </span>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3 text-muted" style={{ fontSize: '14px' }}>
              <span className="d-flex align-items-center gap-1">
                <i className="bi bi-clock"></i> {blog.readingTime || 1} min read
              </span>
              <span className="d-flex align-items-center gap-1">
                <i className="bi bi-eye-fill"></i> {blog.views} views
              </span>
            </div>
          </div>

          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="mb-5 rounded-4 overflow-hidden shadow-sm" style={{ maxHeight: '450px' }}>
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-100"
                style={{ objectFit: 'cover', maxHeight: '450px' }}
              />
            </div>
          )}

          {/* Blog Content */}
          <article
            className="fs-5 lh-lg text-secondary mb-5 blog-post-body"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          ></article>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mb-4 pt-3 border-top">
              <h6 className="fw-bold mb-2 d-inline-block me-3">Tags:</h6>
              {blog.tags.map((tag, idx) => (
                <span key={idx} className="badge bg-light text-dark rounded-pill py-2 px-3 me-2 border">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Biography Info Card */}
          {blog.author && (
            <div className="card border-0 bg-light p-4 rounded-4 shadow-sm my-5">
              <div className="row g-3 align-items-center">
                <div className="col-auto">
                  {blog.author.profileImage ? (
                    <img
                      src={blog.author.profileImage}
                      alt={blog.author.name}
                      className="rounded-circle shadow-sm"
                      style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '70px', height: '70px', fontSize: '24px' }}>
                      {blog.author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="col">
                  <h6 className="fw-bold mb-1">About the Author: {blog.author.name}</h6>
                  <p className="text-secondary small mb-2">{blog.author.bio || 'Professional contributor to the SmartBlog portal.'}</p>
                  
                  {/* Author Social Media Handles */}
                  {blog.author.socialLinks && (
                    <div className="d-flex gap-2">
                      {blog.author.socialLinks.facebook && (
                        <a href={blog.author.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-primary"><i className="bi bi-facebook fs-5"></i></a>
                      )}
                      {blog.author.socialLinks.twitter && (
                        <a href={blog.author.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-dark"><i className="bi bi-twitter-x fs-5"></i></a>
                      )}
                      {blog.author.socialLinks.linkedin && (
                        <a href={blog.author.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-info"><i className="bi bi-linkedin fs-5"></i></a>
                      )}
                      {blog.author.socialLinks.github && (
                        <a href={blog.author.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-dark"><i className="bi bi-github fs-5"></i></a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Related Blogs Section */}
          {related.length > 0 && (
            <div className="my-5 pt-5 border-top">
              <h3 className="fw-bold mb-4">Related Articles</h3>
              <div className="row g-4">
                {related.map((item) => (
                  <div key={item._id} className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                      <div style={{ height: '140px' }}>
                        {item.featuredImage ? (
                          <img
                            src={item.featuredImage}
                            alt={item.title}
                            className="w-100 h-100"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white">
                            <i className="bi bi-image fs-4"></i>
                          </div>
                        )}
                      </div>
                      <div className="card-body p-3">
                        <h6 className="fw-bold mb-2">
                          <Link to={`/blogs/${item.slug}`} className="text-dark text-decoration-none hover-primary">
                            {item.title}
                          </Link>
                        </h6>
                        <span className="text-muted" style={{ fontSize: '11px' }}>
                          By {item.author?.name || 'Author'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="pt-5 border-top">
            <CommentSection blogId={blog._id} />
          </div>

        </div>

      </div>
    </div>
  );
};

export default BlogDetail;
