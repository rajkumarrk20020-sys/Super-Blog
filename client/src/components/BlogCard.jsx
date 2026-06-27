import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const plainContent = stripHtml(blog.content);
  const truncatedContent = plainContent.length > 120 
    ? plainContent.substring(0, 120) + '...' 
    : plainContent;

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="card h-100 blog-card">
      <div className="position-relative overflow-hidden" style={{ height: '220px' }}>
        {blog.featuredImage ? (
          <img
            src={blog.featuredImage}
            className="card-img-top w-100 h-100"
            alt={blog.title}
            style={{ objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white" style={{ opacity: 0.8 }}>
            <i className="bi bi-image fs-1"></i>
          </div>
        )}
        <span className="position-absolute top-0 start-0 m-3 badge bg-primary rounded-pill py-2 px-3 fw-bold">
          {blog.category?.name || 'Uncategorized'}
        </span>
      </div>
      <div className="card-body d-flex flex-column p-4">
        <h4 className="card-title mb-3 fs-5">
          <Link to={`/blogs/${blog.slug}`} className="text-dark text-decoration-none hover-primary">
            {blog.title}
          </Link>
        </h4>
        <p className="card-text text-muted mb-4 fs-6 flex-grow-1">
          {truncatedContent}
        </p>
        <hr className="text-muted opacity-25" />
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            {blog.author?.profileImage ? (
              <img
                src={blog.author.profileImage}
                alt={blog.author.name}
                className="rounded-circle"
                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                loading="lazy"
              />
            ) : (
              <div className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                {blog.author?.name ? blog.author.name.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
            <div>
              <span className="d-block fw-semibold text-dark" style={{ fontSize: '13px' }}>
                {blog.author?.name || 'Deleted User'}
              </span>
              <span className="text-muted" style={{ fontSize: '11px' }}>
                {formattedDate} • <i className="bi bi-clock"></i> {blog.readingTime || 1} min
              </span>
            </div>
          </div>
          <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '12px' }}>
            <i className="bi bi-eye-fill"></i>
            <span>{blog.views}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
