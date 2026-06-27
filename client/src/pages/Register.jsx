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
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card border-0 shadow-lg rounded-4 p-5 bg-white">
            
            <div className="text-center mb-4">
              <i className="bi bi-person-plus-fill text-primary fs-1"></i>
              <h2 className="fw-bold mt-2">Create Account</h2>
              <p className="text-muted">Register to join the blogging community</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control form-control-premium"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control form-control-premium"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control form-control-premium"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Profile Picture (Optional)</label>
                <input
                  type="file"
                  className="form-control form-control-premium"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <button type="submit" className="btn btn-premium-primary w-100 py-2 mb-3" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Account...
                  </>
                ) : (
                  'Register'
                )}
              </button>
            </form>

            <div className="text-center mt-3">
              <span className="text-muted">Already have an account? </span>
              <Link to="/login" className="fw-bold text-primary text-decoration-none">Login Here</Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
