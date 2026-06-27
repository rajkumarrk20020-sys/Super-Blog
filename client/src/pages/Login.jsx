import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;

  useEffect(() => {
    // If already logged in, redirect
    if (user) {
      if (user.role === 'Admin' || user.role === 'Author') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res?.success) {
      // Navigate is handled by useEffect
    }
  };

  return (
    <div className="container py-5 my-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card border-0 shadow-lg rounded-4 p-5 bg-white">
            
            <div className="text-center mb-4">
              <i className="bi bi-rocket-takeoff-fill text-primary fs-1"></i>
              <h2 className="fw-bold mt-2">Welcome Back</h2>
              <p className="text-muted">Sign in to manage your blogs and discussions</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control form-control-premium"
                  placeholder="john@example.com"
                  value={email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control form-control-premium"
                  placeholder="••••••••"
                  value={password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-premium-primary w-100 py-2 mb-3" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            <div className="text-center mt-3">
              <span className="text-muted">Don't have an account? </span>
              <Link to="/register" className="fw-bold text-primary text-decoration-none">Register Here</Link>
            </div>

            {/* Quick Helper Credentials */}
            <div className="alert alert-secondary rounded-3 mt-4 mb-0 text-center" style={{ fontSize: '13px' }}>
              <strong>Demo Credentials:</strong><br />
              Admin: <code>admin@smartblog.com</code> / <code>admin123</code><br />
              Author: <code>author@smartblog.com</code> / <code>author123</code>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
