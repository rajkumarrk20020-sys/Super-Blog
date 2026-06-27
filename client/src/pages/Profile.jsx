import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import getImageUrl from '../utils/getImageUrl';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        
        {/* Profile Card Column */}
        <div className="col-lg-5 mb-4">
          <div className="card border-0 shadow-lg rounded-4 p-5 bg-white text-center">
            
            <div className="mb-4">
              {user.profileImage ? (
                <img
                  src={getImageUrl(user.profileImage)}
                  alt={user.name}
                  className="rounded-circle border border-4 border-primary shadow-sm"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              ) : (
                <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-extrabold shadow-sm" style={{ width: '150px', height: '150px', fontSize: '64px' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <span className="badge bg-secondary mb-3 rounded-pill px-3 py-2 text-uppercase">{user.role} Account</span>
            <h2 className="fw-bold mb-2">{user.name}</h2>
            <p className="text-muted mb-4"><i className="bi bi-envelope-fill me-2"></i> {user.email}</p>

            {user.bio && (
              <p className="text-secondary fs-6 mb-4 px-2 italic" style={{ fontStyle: 'italic' }}>
                "{user.bio}"
              </p>
            )}

            {/* Social Links Bar */}
            {user.socialLinks && (Object.values(user.socialLinks).some(link => link) && (
              <div className="d-flex justify-content-center gap-3 mb-4">
                {user.socialLinks.facebook && (
                  <a href={user.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm rounded-circle p-2" style={{ width: '38px', height: '38px' }}>
                    <i className="bi bi-facebook"></i>
                  </a>
                )}
                {user.socialLinks.twitter && (
                  <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark btn-sm rounded-circle p-2" style={{ width: '38px', height: '38px' }}>
                    <i className="bi bi-twitter-x"></i>
                  </a>
                )}
                {user.socialLinks.linkedin && (
                  <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-outline-info btn-sm rounded-circle p-2" style={{ width: '38px', height: '38px' }}>
                    <i className="bi bi-linkedin"></i>
                  </a>
                )}
                {user.socialLinks.github && (
                  <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark btn-sm rounded-circle p-2" style={{ width: '38px', height: '38px' }}>
                    <i className="bi bi-github"></i>
                  </a>
                )}
              </div>
            ))}

            <hr className="my-4 text-muted opacity-25" />

            <div className="d-flex flex-column gap-3 mb-4 align-items-start bg-light p-4 rounded-3 text-start">
              <div className="d-flex justify-content-between w-100">
                <span className="text-muted">Account Type:</span>
                <span className="fw-bold">{user.role}</span>
              </div>
              <div className="d-flex justify-content-between w-100">
                <span className="text-muted">Registered On:</span>
                <span className="fw-bold">{new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}</span>
              </div>
            </div>

            <div className="d-flex flex-column gap-2 w-100">
              <Link to="/profile/settings" className="btn btn-outline-primary rounded-3 w-100 py-2 fw-medium">
                <i className="bi bi-gear me-2"></i> Account Settings
              </Link>
              {['Admin', 'Author', 'Editor'].includes(user.role) && (
                <Link to="/admin/dashboard" className="btn btn-premium-primary rounded-3 w-100 py-2">
                  <i className="bi bi-speedometer2 me-2"></i> Creator Portal
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* Activity History Column */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h4 className="fw-bold mb-4"><i className="bi bi-clock-history me-2 text-primary"></i> Activity Log</h4>
            
            {user.activityHistory && user.activityHistory.length > 0 ? (
              <div className="list-group list-group-flush">
                {user.activityHistory.slice().reverse().map((act, idx) => (
                  <div key={idx} className="list-group-item border-0 px-0 py-3 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-2 text-primary">
                        <i className="bi bi-activity"></i>
                      </div>
                      <div>
                        <span className="d-block fw-semibold text-dark">{act.action}</span>
                        <small className="text-muted">Completed successfully</small>
                      </div>
                    </div>
                    <span className="text-secondary small">
                      {new Date(act.timestamp).toLocaleDateString()} at {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted py-3 mb-0">No activities recorded yet.</p>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
