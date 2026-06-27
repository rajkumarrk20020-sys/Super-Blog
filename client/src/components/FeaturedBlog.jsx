import React from 'react';
import { Link } from 'react-router-dom';
import getImageUrl from '../utils/getImageUrl';

const FeaturedBlog = ({ blog }) => {
  if (!blog) return null;

  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const plainContent = stripHtml(blog.content);
  const truncatedContent = plainContent.length > 200 
    ? plainContent.substring(0, 200) + '...' 
    : plainContent;

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-5">
      <div className="row g-0">
        <div className="col-lg-6" style={{ minHeight: '350px' }}>
          {blog.featuredImage ? (
            <img
              src={getImageUrl(blog.featuredImage)}
              alt={blog.title}
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
              loading="lazy"
            />
          ) : (
            <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white">
              <i className="bi bi-image fs-1"></i>
            </div>
          )}
        </div>
        <div className="col-lg-6 d-flex flex-column justify-content-center p-5 bg-white">
          <div>
            <span className="badge bg-primary rounded-pill py-2 px-3 fw-bold mb-3">
              {blog.category?.name || 'Featured'}
            </span>
            <h2 className="display-6 fw-bold mb-3">
              <Link to={`/blogs/${blog.slug}`} className="text-dark text-decoration-none hover-primary">
                {blog.title}
              </Link>
            </h2>
            <p className="text-muted fs-5 mb-4">
              {truncatedContent}
            </p>
          </div>
          <div className="d-flex align-items-center justify-content-between mt-auto">
            <div className="d-flex align-items-center gap-3">
              {blog.author?.profileImage ? (
                <img
                  src={getImageUrl(blog.author.profileImage)}
                  alt={blog.author.name}
                  className="rounded-circle"
                  style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                  loading="lazy"
                />
              ) : (
                <div className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '48px', height: '48px' }}>
                  {blog.author?.name ? blog.author.name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <div>
                <span className="d-block fw-bold text-dark">{blog.author?.name || 'Deleted User'}</span>
                <span className="text-muted" style={{ fontSize: '13px' }}>
                  {formattedDate} • <i className="bi bi-clock"></i> {blog.readingTime || 1} min read
                </span>
              </div>
            </div>
            <Link to={`/blogs/${blog.slug}`} className="btn btn-premium-primary rounded-pill px-4">
              Read Article <i className="bi bi-arrow-right ms-2"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedBlog;
