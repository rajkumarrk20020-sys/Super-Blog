import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { register, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { name, email, password } = formData;

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfileImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Build multipart form data for uploading profile image
    const data = new FormData();
    data.append('name', name);
    data.append('email', email);
    data.append('password', password);
    if (profileImageFile) {
      data.append('profileImage', profileImageFile);
    }

    const res = await register(data);
    if (res?.success) {
      navigate('/');
    }
  };

  return (
    <div className="container py-5 my-4">
      <div className="auth-split">
        <div className="auth-left">
          <div className="auth-illustration">
            <svg width="100%" height="320" viewBox="0 0 800 380" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
              <rect x="0" y="0" width="800" height="380" rx="24" fill="url(#g2)" />
              <defs>
                <linearGradient id="g2" x1="0" x2="1">
                  <stop offset="0" stopColor="#eef2ff" />
                  <stop offset="1" stopColor="#f3e8ff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="auth-features mt-4">
            <div className="auth-feature">Publish faster</div>
            <div className="auth-feature">Built for creators</div>
            <div className="auth-feature">Secure accounts</div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-hero p-4">
              <div className="text-start">
                <i className="bi bi-person-plus-fill text-primary fs-2"></i>
                <h2 className="fw-bold">Create Your Account</h2>
                <p className="text-muted">Join SmartBlog and start sharing your work.</p>
              </div>
            </div>

            <div className="p-4 bg-white">
              <form onSubmit={handleSubmit}>
                <div className="form-floating-auth">
                  <input type="text" name="name" value={name} onChange={handleChange} required placeholder=" " />
                  <label>Full Name</label>
                </div>

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

                <div className="mb-3">
                  <label className="form-label fw-semibold">Profile Picture (Optional)</label>
                  <input
                    type="file"
                    className="form-control form-control-premium"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="form-check mb-3">
                  <input className="form-check-input" type="checkbox" id="terms" />
                  <label className="form-check-label" htmlFor="terms">I agree to the Terms and Privacy Policy</label>
                </div>

                <button type="submit" className="btn btn-premium-primary w-100 py-2 mb-3" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="text-center mt-3">
                <span className="text-muted">Already have an account? </span>
                <Link to="/login" className="fw-bold text-primary text-decoration-none">Login Here</Link>
              </div>
            </div>
            <div className="auth-foot">By creating an account you agree to our terms.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
