import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/blogs?search=${encodeURIComponent(searchVal.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchVal(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await api.get(`/blogs/suggestions?search=${encodeURIComponent(val)}`);
      if (res.data.success) {
        setSuggestions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isCreator = user && ['Admin', 'Author', 'Editor'].includes(user.role);

  return (
    <nav className="navbar navbar-expand-lg navbar-light glass-nav sticky-top py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-rocket-takeoff-fill text-primary me-2 fs-3"></i>
          <span className="fw-extrabold fs-4 tracking-tight text-gradient">SMARTBLOG</span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto align-items-center">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 fw-medium ${isActive ? 'text-primary' : 'text-secondary'}`} to="/" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 fw-medium ${isActive ? 'text-primary' : 'text-secondary'}`} to="/blogs">
                Blogs
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 fw-medium ${isActive ? 'text-primary' : 'text-secondary'}`} to="/about">
                About Us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 fw-medium ${isActive ? 'text-primary' : 'text-secondary'}`} to="/contact">
                Contact Us
              </NavLink>
            </li>
          </ul>
          
          <div className="position-relative me-lg-3 my-2 my-lg-0" ref={suggestionRef} style={{ width: '220px' }}>
            <form onSubmit={handleSearchSubmit} className="w-100">
              <div className="input-group input-group-sm">
                <input
                  type="text"
                  className="form-control rounded-pill-start border-end-0 bg-light px-3 py-2"
                  placeholder="Search blogs..."
                  value={searchVal}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSuggestions(true)}
                  style={{ fontSize: '0.875rem' }}
                />
                <button className="btn btn-light border border-start-0 rounded-pill-end bg-light" type="submit">
                  <i className="bi bi-search text-muted"></i>
                </button>
              </div>
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <ul className="dropdown-menu show w-100 border-0 shadow rounded-3 mt-1 position-absolute" style={{ maxHeight: '250px', overflowY: 'auto', zIndex: 1050 }}>
                {suggestions.map((suggestion) => (
                  <li key={suggestion._id}>
                    <button
                      className="dropdown-item text-truncate py-2 w-100 text-start border-0 bg-transparent"
                      onClick={() => {
                        navigate(`/blogs/${suggestion.slug}`);
                        setSearchVal('');
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
                      style={{ fontSize: '0.85rem' }}
                    >
                      <i className="bi bi-file-earmark-text text-muted me-2"></i>
                      {suggestion.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-link nav-link dropdown-toggle d-flex align-items-center gap-2 border-0 bg-transparent text-dark fw-medium"
                  type="button"
                  id="dropdownUser"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="rounded-circle border border-2 border-primary"
                      style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>Hi, {user.name.split(' ')[0]}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-4 mt-2" aria-labelledby="dropdownUser">
                  <li className="dropdown-header text-muted">Role: <span className="badge bg-secondary">{user.role}</span></li>
                  <li>
                    <Link className="dropdown-item py-2" to="/profile">
                      <i className="bi bi-person me-2"></i> My Profile
                    </Link>
                  </li>
                  
                  {/* Author / Editor / Admin Link */}
                  {isCreator && (
                    <li>
                      <Link className="dropdown-item py-2" to="/admin/dashboard">
                        <i className="bi bi-speedometer2 me-2"></i> Creator Portal
                      </Link>
                    </li>
                  )}
                  
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-secondary px-4 border-2 rounded-3 fw-medium">
                  Login
                </Link>
                <Link to="/register" className="btn btn-premium-primary px-4 rounded-3">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
