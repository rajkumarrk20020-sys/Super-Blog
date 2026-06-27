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
    <article className="blog-card-premium h-100 shadow-sm rounded-4 overflow-hidden">
      <div className="card-media position-relative overflow-hidden" style={{ minHeight: '240px' }}>
        {blog.featuredImage ? (
          <img
            src={blog.featuredImage}
            className="w-100 h-100 card-media-img"
            alt={blog.title}
            style={{ objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white" style={{ opacity: 0.85 }}>
            <i className="bi bi-image fs-1"></i>
          </div>
        )}
        <span className="category-pill position-absolute top-0 start-0 m-3">{blog.category?.name || 'Uncategorized'}</span>
      </div>
      <div className="p-4 d-flex flex-column h-100">
        <div className="mb-3">
          <h3 className="fs-5 fw-semibold mb-2 line-clamp-2">
            <Link to={`/blogs/${blog.slug}`} className="text-dark text-decoration-none blog-card-title">
              {blog.title}
            </Link>
          </h3>
          <p className="text-muted mb-0 fs-6 line-clamp-3">{truncatedContent}</p>
        </div>
        <div className="mt-auto pt-3 border-top" style={{ borderColor: 'rgba(15, 23, 42, 0.08)' }}>
          <div className="d-flex align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2">
              {blog.author?.profileImage ? (
                <img
                  src={blog.author.profileImage}
                  alt={blog.author.name}
                  className="rounded-circle"
                  style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                  loading="lazy"
                />
              ) : (
                <div className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px', fontSize: '13px' }}>
                  {blog.author?.name ? blog.author.name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <div>
                <p className="mb-0 fw-semibold" style={{ fontSize: '0.88rem' }}>{blog.author?.name || 'Deleted User'}</p>
                <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{formattedDate} • {blog.readingTime || 1} min</p>
              </div>
            </div>
            <div className="text-muted small d-flex align-items-center gap-1">
              <i className="bi bi-eye-fill"></i>
              <span>{blog.views}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
