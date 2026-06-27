import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import CommentSection from '../components/CommentSection';
import getImageUrl from '../utils/getImageUrl';

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
        const res = await api.get(`/blogs/${slug}`);
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
          const relatedRes = await api.get(`/blogs/${fetchedBlog._id}/related`);
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
        <div className="col-lg-10">
          <section className="article-hero rounded-4 overflow-hidden shadow-sm mb-5">
            {blog.featuredImage && (
              <div className="hero-image position-relative overflow-hidden" style={{ minHeight: '420px' }}>
                <img src={getImageUrl(blog.featuredImage)} alt={blog.title} className="w-100 h-100 object-cover" loading="lazy" />
                <span className="article-category-pill position-absolute top-0 start-0 m-4">{blog.category?.name}</span>
              </div>
            )}
            <div className="hero-content p-5 bg-white">
              <div className="mb-3 text-uppercase text-primary fw-semibold letter-spacing">Featured article</div>
              <h1 className="display-5 fw-bold mb-4">{blog.title}</h1>
              <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3 text-secondary mb-4">
                <div className="d-flex align-items-center gap-3">
                  {blog.author?.profileImage ? (
                    <img src={getImageUrl(blog.author.profileImage)} alt={blog.author.name} className="rounded-circle" style={{ width: '52px', height: '52px', objectFit: 'cover' }} loading="lazy" />
                  ) : (
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '52px', height: '52px', fontSize: '18px' }}>
                      {blog.author?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                  )}
                  <div>
                    <p className="mb-1 fw-semibold">{blog.author?.name || 'Author'}</p>
                    <p className="text-muted small mb-0">{blog.author?.role || 'Contributor'}</p>
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-3 text-muted small">
                  <span>{formattedDate}</span>
                  <span>{blog.readingTime || 1} min read</span>
                  <span>{blog.views} views</span>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <button className="btn btn-outline-secondary rounded-pill btn-sm">Like</button>
                <button className="btn btn-outline-secondary rounded-pill btn-sm">Bookmark</button>
                <button className="btn btn-outline-secondary rounded-pill btn-sm">Share</button>
                <button className="btn btn-outline-secondary rounded-pill btn-sm">Copy link</button>
              </div>
            </div>
          </section>

          <div className="row gx-5">
            <div className="col-lg-8">
              <article className="article-body bg-white rounded-4 shadow-sm p-5 mb-5">
                <div className="content-body blog-post-body">
                  <div dangerouslySetInnerHTML={{ __html: blog.content }}></div>
                </div>

                {blog.tags && blog.tags.length > 0 && (
                  <div className="mt-5 pt-4 border-top">
                    <h5 className="fw-semibold mb-3">Tags</h5>
                    <div className="d-flex flex-wrap gap-2">
                      {blog.tags.map((tag, idx) => (
                        <span key={idx} className="tag-pill">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="author-card rounded-4 bg-offwhite border p-4 mt-5">
                  <div className="d-flex align-items-center gap-3">
                    {blog.author?.profileImage ? (
                      <img src={getImageUrl(blog.author.profileImage)} alt={blog.author.name} className="rounded-circle" style={{ width: '64px', height: '64px', objectFit: 'cover' }} loading="lazy" />
                    ) : (
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '64px', height: '64px', fontSize: '22px' }}>
                        {blog.author?.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                    )}
                    <div>
                      <p className="text-uppercase text-primary small mb-1">About the author</p>
                      <h5 className="fw-bold mb-1">{blog.author?.name}</h5>
                      <p className="text-muted mb-0">{blog.author?.bio || 'Professional contributor to the SmartBlog portal.'}</p>
                    </div>
                  </div>
                </div>
              </article>
            </div>
            <aside className="col-lg-4">
              <div className="toc-panel rounded-4 border bg-white shadow-sm p-4 mb-4 sticky-lg">
                <h5 className="fw-bold mb-3">On this page</h5>
                <div className="toc-links">
                  {/* remain with existing content, not auto-generated */}
                </div>
              </div>
            </aside>
          </div>

          {related.length > 0 && (
            <div className="related-articles-section mb-5">
              <h3 className="fw-bold mb-4">Related Articles</h3>
              <div className="row g-4">
                {related.map((item) => (
                  <div key={item._id} className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                      <div className="ratio ratio-16x9">
                        {item.featuredImage ? (
                          <img src={getImageUrl(item.featuredImage)} alt={item.title} className="w-100 h-100 object-cover" />
                        ) : (
                          <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white">
                            <i className="bi bi-image fs-4"></i>
                          </div>
                        )}
                      </div>
                      <div className="card-body p-4">
                        <h6 className="fw-semibold mb-2 line-clamp-2">
                          <Link to={`/blogs/${item.slug}`} className="text-dark text-decoration-none hover-primary">{item.title}</Link>
                        </h6>
                        <p className="text-muted small mb-3">{item.author?.name || 'Author'}</p>
                        <div className="d-flex align-items-center justify-content-between text-muted small">
                          <span>{item.readingTime || 1} min read</span>
                          <span>{item.views} views</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="comments-wrapper rounded-4 bg-white shadow-sm p-5 mb-5">
            <CommentSection blogId={blog._id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
