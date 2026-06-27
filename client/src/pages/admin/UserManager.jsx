import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';

const UserManager = () => {
  const { token, showToast, user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load users list.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(
        `/auth/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showToast('User role updated successfully.', 'success');
        setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update user role.', 'danger');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === user?._id) {
      showToast('You cannot delete yourself!', 'warning');
      return;
    }

    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;

    try {
      const res = await api.delete(`/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showToast('User account removed successfully.', 'success');
        setUsers(users.filter((u) => u._id !== userId));
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete user.', 'danger');
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
              <Link to="/admin/users" className="nav-link active">
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

        {/* User Manager Main */}
        <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2 fw-bold">Manage Users</h1>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading users...</span>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              {users.length > 0 ? (
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Avatar</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role / Permissions</th>
                        <th>Registered Date</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((item) => (
                        <tr key={item._id} className={item._id === user?._id ? 'table-primary bg-opacity-10' : ''}>
                          <td>
                            {item.profileImage ? (
                              <img
                                src={item.profileImage}
                                alt={item.name}
                                className="rounded-circle"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                                {item.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td className="fw-bold">{item.name} {item._id === user?._id && <span className="badge bg-primary ms-1">You</span>}</td>
                          <td>{item.email}</td>
                          <td>
                            <select
                              className="form-select form-select-sm rounded-3 fw-medium w-auto"
                              value={item.role}
                              onChange={(e) => handleRoleChange(item._id, e.target.value)}
                              disabled={item._id === user?._id}
                            >
                              <option value="Visitor">Visitor</option>
                              <option value="Author">Author</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </td>
                          <td className="text-secondary small">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger rounded-3"
                              onClick={() => handleDeleteUser(item._id)}
                              disabled={item._id === user?._id}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted mb-0">No users found.</p>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default UserManager;
