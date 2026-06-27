import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';

const ContactInquiries = () => {
  const { token, user, showToast } = useContext(AuthContext);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const res = await api.get('/contact', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setInquiries(res.data.data);
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to retrieve contact inquiries.', 'danger');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInquiries();
    }
  }, [token]);

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
              <Link to="/admin/users" className="nav-link">
                <i className="bi bi-people me-2"></i> User Manager
              </Link>
            </li>
            <li>
              <Link to="/admin/contacts" className="nav-link active">
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

        {/* Contact inquiries main */}
        <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2 fw-bold">Contact Inquiries</h1>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading inquiries...</span>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              {inquiries.length > 0 ? (
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Sender Info</th>
                        <th>Subject</th>
                        <th>Message Message</th>
                        <th>Received On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <span className="d-block fw-bold">{item.name}</span>
                            <a href={`mailto:${item.email}`} className="small text-decoration-none">{item.email}</a>
                          </td>
                          <td className="fw-semibold text-dark">{item.subject}</td>
                          <td className="text-secondary" style={{ maxWidth: '350px', whiteSpace: 'normal', fontSize: '14px' }}>
                            {item.message}
                          </td>
                          <td className="text-muted small">
                            {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted mb-0">No contact inquiries found.</p>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ContactInquiries;
