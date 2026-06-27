import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';
import RichTextEditor from '../../components/RichTextEditor';
import getImageUrl from '../../utils/getImageUrl';

const BlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, showToast, user } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  // Form fields state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('Draft');
  const [tags, setTags] = useState('');
  const [featuredImageFile, setFeaturedImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState('');

  // Enhanced Meta & Publishing states
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const isEditMode = !!id;

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
        if (res.data.data.length > 0 && !isEditMode) {
          setCategory(res.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchBlogDetails = async () => {
    try {
      setFetchingData(true);
      const res = await api.get(`/blogs/${id}`);
      if (res.data.success) {
        const blog = res.data.data;
        setTitle(blog.title);
        setContent(blog.content);
        setCategory(blog.category?._id || '');
        setStatus(blog.status);
        setTags(blog.tags ? blog.tags.join(', ') : '');
        setExistingImage(blog.featuredImage || '');
        
        // Populate Meta & Publishing settings
        setMetaTitle(blog.metaTitle || '');
        setMetaDescription(blog.metaDescription || '');
        setMetaKeywords(blog.metaKeywords ? blog.metaKeywords.join(', ') : '');
        setIsFeatured(blog.isFeatured || false);
        
        if (blog.publishedAt) {
          // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
          const dateObj = new Date(blog.publishedAt);
          const formattedDate = dateObj.toISOString().slice(0, 16);
          setPublishedAt(formattedDate);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch blog post details.', 'danger');
      navigate('/admin/blogs');
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchBlogDetails();
    }
  }, [id]);

  const handleFileChange = (e) => {
    setFeaturedImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !category) {
      showToast('Please fill out all required fields.', 'warning');
      return;
    }

    if (status === 'Scheduled' && !publishedAt) {
      showToast('Please specify a scheduled release date and time.', 'warning');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      formData.append('status', status);
      formData.append('tags', tags);
      formData.append('metaTitle', metaTitle || title);
      formData.append('metaDescription', metaDescription);
      formData.append('metaKeywords', metaKeywords);
      formData.append('isFeatured', isFeatured);
      
      if (status === 'Scheduled' && publishedAt) {
        formData.append('publishedAt', new Date(publishedAt).toISOString());
      }

      if (featuredImageFile) {
        formData.append('featuredImage', featuredImageFile);
      }

      let res;
      if (isEditMode) {
        res = await api.put(`/blogs/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        res = await api.post('/blogs', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      }

      if (res.data.success) {
        showToast(
          isEditMode ? 'Blog post updated successfully!' : 'Blog post created successfully!',
          'success'
        );
        navigate('/admin/blogs');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to save blog post.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const isAdminOrEditor = user && ['Admin', 'Editor'].includes(user.role);

  return (
    <div className="container-fluid">
      <div className="row">
        
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 px-0 admin-sidebar d-none d-md-block shadow-sm">
          <div className="p-4 text-center border-bottom border-secondary mb-3">
            <span className="fw-bold text-white fs-5">{user?.role} Portal</span>
          </div>
          <ul className="nav nav-pills flex-column mb-auto">
            <li>
              <Link to="/admin/dashboard" className="nav-link">
                <i className="bi bi-speedometer2 me-2"></i> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/blogs" className="nav-link active">
                <i className="bi bi-journal-text me-2"></i> Blog Manager
              </Link>
            </li>
            {isAdminOrEditor && (
              <>
                <li>
                  <Link to="/admin/categories" className="nav-link">
                    <i className="bi bi-tags me-2"></i> Categories
                  </Link>
                </li>
                <li>
                  <Link to="/admin/comments" className="nav-link">
                    <i className="bi bi-chat-left-text me-2"></i> Comments
                  </Link>
                </li>
                {user.role === 'Admin' && (
                  <li>
                    <Link to="/admin/users" className="nav-link">
                      <i className="bi bi-people me-2"></i> User Manager
                    </Link>
                  </li>
                )}
                <li>
                  <Link to="/admin/contacts" className="nav-link">
                    <i className="bi bi-envelope me-2"></i> Contact Inquiries
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link to="/profile" className="nav-link mt-4 text-secondary">
                <i className="bi bi-person-circle me-2"></i> View Profile
              </Link>
            </li>
          </ul>
        </div>

        {/* Blog Form Main */}
        <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2 fw-bold">{isEditMode ? 'Edit Blog Post' : 'Create Blog Post'}</h1>
            <Link to="/admin/blogs" className="btn btn-outline-secondary rounded-3">
              <i className="bi bi-arrow-left me-1"></i> Back to Manager
            </Link>
          </div>

          {fetchingData ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading details...</span>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 p-5 bg-white mb-5">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  
                  {/* Left Column Fields */}
                  <div className="col-lg-8">
                    <div className="mb-4">
                      <label className="form-label fw-bold">Blog Title <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control form-control-premium"
                        placeholder="Enter catching title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-bold">Content <span className="text-danger">*</span></label>
                      <RichTextEditor value={content} onChange={setContent} />
                    </div>

                    <hr className="my-4 text-muted opacity-25" />
                    
                    {/* SEO Meta Fields */}
                    <div className="p-4 bg-light rounded-4 border">
                      <h5 className="fw-bold mb-3 text-primary"><i className="bi bi-search me-2"></i> SEO Meta Configuration</h5>
                      
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Meta Title</label>
                        <input
                          type="text"
                          className="form-control form-control-premium"
                          placeholder="Recommended under 60 characters"
                          value={metaTitle}
                          onChange={(e) => setMetaTitle(e.target.value)}
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Meta Description</label>
                        <textarea
                          className="form-control form-control-premium"
                          rows="3"
                          placeholder="Recommended under 160 characters..."
                          value={metaDescription}
                          onChange={(e) => setMetaDescription(e.target.value)}
                        ></textarea>
                      </div>

                      <div className="mb-0">
                        <label className="form-label fw-semibold">Meta Keywords (Comma Separated)</label>
                        <input
                          type="text"
                          className="form-control form-control-premium"
                          placeholder="keyword1, keyword2, tag topic"
                          value={metaKeywords}
                          onChange={(e) => setMetaKeywords(e.target.value)}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Right Column Options */}
                  <div className="col-lg-4">
                    <div className="mb-4">
                      <label className="form-label fw-bold">Category <span className="text-danger">*</span></label>
                      <select
                        className="form-select form-control-premium"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      >
                        <option value="" disabled>Select category...</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-bold">Publishing Status</label>
                      <select
                        className="form-select form-control-premium"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                        <option value="Scheduled">Scheduled</option>
                      </select>
                    </div>

                    {status === 'Scheduled' && (
                      <div className="mb-4 animate__animated animate__fadeIn">
                        <label className="form-label fw-bold text-primary">Scheduled Release Date <span className="text-danger">*</span></label>
                        <input
                          type="datetime-local"
                          className="form-control form-control-premium border-primary"
                          value={publishedAt}
                          onChange={(e) => setPublishedAt(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="form-label fw-bold">Tags (Comma Separated)</label>
                      <input
                        type="text"
                        className="form-control form-control-premium"
                        placeholder="AI, Code, Bootstrap"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>

                    {/* Featured Checkbox */}
                    <div className="mb-4 form-check form-switch p-3 bg-light rounded border">
                      <input
                        className="form-check-input ms-0 me-2"
                        type="checkbox"
                        id="flexSwitchFeatured"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                      />
                      <label className="form-check-label fw-bold" htmlFor="flexSwitchFeatured">
                        Mark as Featured Blog
                      </label>
                      <small className="text-muted d-block mt-1">Featured blogs are pinned to the homepage hero banner.</small>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-bold">Featured Image</label>
                      {existingImage && (
                        <div className="mb-2 position-relative rounded overflow-hidden shadow-sm" style={{ height: '150px' }}>
                          <img
                            src={getImageUrl(existingImage)}
                            alt="Existing featured image"
                            className="w-100 h-100"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        className="form-control form-control-premium"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <small className="text-muted d-block mt-1">Leave empty to preserve existing image.</small>
                    </div>

                    <hr className="my-4 text-muted opacity-25" />

                    <button type="submit" className="btn btn-premium-primary w-100 py-3 rounded-3" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving Post...
                        </>
                      ) : (
                        'Save Blog Post'
                      )}
                    </button>

                  </div>

                </div>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default BlogForm;
