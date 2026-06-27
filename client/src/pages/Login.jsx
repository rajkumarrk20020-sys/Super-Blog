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
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="auth-split">
        <div className="auth-left">
          <div className="auth-illustration">
            <svg width="100%" height="320" viewBox="0 0 800 380" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
              <rect x="0" y="0" width="800" height="380" rx="24" fill="url(#g)" />
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0" stopColor="#eef2ff" />
                  <stop offset="1" stopColor="#f3e8ff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="auth-features mt-4">
            <div className="auth-feature">Fast publishing</div>
            <div className="auth-feature">Clean editor</div>
            <div className="auth-feature">Secure by default</div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-hero p-4">
              <div className="text-start">
                <i className="bi bi-rocket-takeoff-fill text-primary fs-2"></i>
                <h2 className="fw-bold">Welcome Back</h2>
                <p className="text-muted">Continue your writing journey.</p>
              </div>
            </div>

            <div className="p-4 bg-white">
              <form onSubmit={handleSubmit}>
                <div className="form-floating-auth">
                  <input type="email" name="email" value={email} onChange={handleChange} required placeholder=" " />
                  <label>Email Address</label>
                </div>

                <div className="form-floating-auth" style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} name="password" value={password} onChange={handleChange} required placeholder=" " />
                  <label>Password</label>
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
                    {showPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                  </button>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="rememberMe" />
                    <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                  </div>
                  <Link to="/forgot" className="text-decoration-none">Forgot Password?</Link>
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

                <div className="auth-divider">OR</div>

                <div className="text-center">
                  <button type="button" className="oauth-btn w-100 mb-3">
                    <i className="bi bi-google"></i>
                    Continue with Google
                  </button>
                  <div className="text-muted">Don't have an account? <Link to="/register" className="fw-semibold text-primary">Create one</Link></div>
                </div>
              </form>

            </div>
            <div className="auth-foot">Use demo credentials shown on register page for quick access.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
