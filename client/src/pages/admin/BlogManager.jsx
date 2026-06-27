import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';
import getImageUrl from '../../utils/getImageUrl';

const BlogManager = () => {
  const { user, token, showToast } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const isAdmin = user?.role === 'Admin';
      // If Admin, fetch all. If Author, restrict by author ID.
      const url = isAdmin 
        ? '/blogs?showAll=true&limit=100'
        : `/blogs?authorId=${user?._id}&showAll=true&limit=100`;

      const res = await api.get(url);
      if (res.data.success) {
        setBlogs(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to retrieve blogs.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBlogs();
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const res = await api.delete(`/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showToast('Blog post removed successfully.', 'success');
        setBlogs(blogs.filter((b) => b._id !== id));
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete blog.', 'danger');
    }
  };

  const handleTogglePublish = async (blog) => {
    const newStatus = blog.status === 'Published' ? 'Draft' : 'Published';
    try {
      const res = await api.put(
        `/blogs/${blog._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showToast(`Blog post status set to ${newStatus}.`, 'success');
        setBlogs(blogs.map((b) => (b._id === blog._id ? { ...b, status: newStatus } : b)));
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update blog status.', 'danger');
    }
  };

  const isAdmin = user?.role === 'Admin';

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
            {isAdmin && (
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
                <li>
                  <Link to="/admin/users" className="nav-link">
                    <i className="bi bi-people me-2"></i> User Manager
                  </Link>
                </li>
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

        {/* Blog Manager Main */}
        <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2 fw-bold">Manage Blogs</h1>
            <Link to="/admin/blogs/new" className="btn btn-premium-primary rounded-3">
              <i className="bi bi-plus-lg me-2"></i> Add New Blog
            </Link>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading blogs...</span>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              {blogs.length > 0 ? (
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Featured Image</th>
                        <th>Title</th>
                        <th>Category</th>
                        {isAdmin && <th>Author</th>}
                        <th>Status</th>
                        <th>Views</th>
                        <th>Created At</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.map((blog) => (
                        <tr key={blog._id}>
                          <td>
                            {blog.featuredImage ? (
                              <img
                                src={getImageUrl(blog.featuredImage)}
                                alt={blog.title}
                                className="rounded shadow-sm"
                                style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="rounded bg-secondary text-white d-flex align-items-center justify-content-center" style={{ width: '60px', height: '40px', fontSize: '10px' }}>
                                No Image
                              </div>
                            )}
                          </td>
                          <td>
                            <Link to={`/blogs/${blog.slug}`} className="text-dark fw-bold text-decoration-none hover-primary">
                              {blog.title}
                            </Link>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {blog.category?.name || 'Uncategorized'}
                            </span>
                          </td>
                          {isAdmin && <td>{blog.author?.name}</td>}
                          <td>
                            <button
                              type="button"
                              className={`btn btn-sm ${blog.status === 'Published' ? 'btn-success' : 'btn-secondary'} rounded-pill px-3`}
                              onClick={() => handleTogglePublish(blog)}
                              title="Click to toggle publish status"
                            >
                              {blog.status}
                            </button>
                          </td>
                          <td>
                            <i className="bi bi-eye text-muted me-1"></i> {blog.views}
                          </td>
                          <td>
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </td>
                          <td className="text-end">
                            <div className="d-flex gap-2 justify-content-end">
                              <Link to={`/admin/blogs/edit/${blog._id}`} className="btn btn-sm btn-outline-primary rounded-3">
                                <i className="bi bi-pencil"></i>
                              </Link>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger rounded-3"
                                onClick={() => handleDelete(blog._id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-journal-x fs-1 text-muted d-block mb-3"></i>
                  <h5>No articles found</h5>
                  <p className="text-muted">Get started by creating your first article post.</p>
                  <Link to="/admin/blogs/new" className="btn btn-primary mt-2">
                    Create a Blog Post
                  </Link>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default BlogManager;
