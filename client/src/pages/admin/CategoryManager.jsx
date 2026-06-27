import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';

const CategoryManager = () => {
  const { token, showToast, user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load categories.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEditSelect = (category) => {
    setEditingId(category._id);
    setName(category.name);
    setDescription(category.description);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      showToast('Please fill out all fields.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        // Edit category
        const res = await api.put(
          `/categories/${editingId}`,
          { name, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          showToast('Category updated successfully!', 'success');
          setCategories(
            categories.map((c) => (c._id === editingId ? res.data.data : c))
          );
          handleCancelEdit();
        }
      } else {
        // Create category
        const res = await api.post(
          '/categories',
          { name, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          showToast('Category created successfully!', 'success');
          setCategories([...categories, res.data.data]);
          setName('');
          setDescription('');
        }
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Operation failed.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await api.delete(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showToast('Category removed successfully.', 'success');
        setCategories(categories.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete category.', 'danger');
    }
  };

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
              <Link to="/admin/blogs" className="nav-link">
                <i className="bi bi-journal-text me-2"></i> Blog Manager
              </Link>
            </li>
            <li>
              <Link to="/admin/categories" className="nav-link active">
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
            <li>
              <Link to="/profile" className="nav-link mt-4 text-secondary">
                <i className="bi bi-person-circle me-2"></i> View Profile
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories Main */}
        <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2 fw-bold">Manage Categories</h1>
          </div>

          <div className="row g-4">
            
            {/* Category Form Card */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <h5 className="fw-bold mb-4">{editingId ? 'Edit Category' : 'Create Category'}</h5>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Category Name</label>
                    <input
                      type="text"
                      className="form-control form-control-premium"
                      placeholder="e.g. Technology"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      className="form-control form-control-premium"
                      rows="4"
                      placeholder="Enter description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-premium-primary w-100" disabled={submitting}>
                      {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary w-100"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Categories Table Card */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <h5 className="fw-bold mb-4">Categories List</h5>
                {loading ? (
                  <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading categories...</span>
                    </div>
                  </div>
                ) : categories.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table align-middle table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Slug</th>
                          <th>Description</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((cat) => (
                          <tr key={cat._id}>
                            <td className="fw-bold text-dark">{cat.name}</td>
                            <td><code>{cat.slug}</code></td>
                            <td className="text-secondary small">{cat.description}</td>
                            <td className="text-end">
                              <div className="d-flex gap-2 justify-content-end">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary rounded-3"
                                  onClick={() => handleEditSelect(cat)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger rounded-3"
                                  onClick={() => handleDelete(cat._id)}
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
                  <p className="text-muted mb-0">No categories found.</p>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default CategoryManager;
