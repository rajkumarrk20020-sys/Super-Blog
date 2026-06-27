import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto">
      <div className="container text-md-left">
        <div className="row text-md-left">
          
          <div className="col-md-4 col-lg-4 col-xl-4 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-gradient">SMARTBLOG</h5>
            <p className="text-muted">
              SmartBlog is an advanced, role-based content management and blog system built for academic and production excellence. Manage your thoughts, categories, and readers seamlessly.
            </p>
          </div>

          <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-white">Categories</h5>
            <p><Link to="/blogs?category=technology" className="text-muted text-decoration-none">Technology</Link></p>
            <p><Link to="/blogs?category=lifestyle" className="text-muted text-decoration-none">Lifestyle</Link></p>
            <p><Link to="/blogs?category=business" className="text-muted text-decoration-none">Business</Link></p>
          </div>

          <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-white">Quick Links</h5>
            <p><Link to="/" className="text-muted text-decoration-none">Home</Link></p>
            <p><Link to="/about" className="text-muted text-decoration-none">About Us</Link></p>
            <p><Link to="/contact" className="text-muted text-decoration-none">Contact Us</Link></p>
            <p><Link to="/login" className="text-muted text-decoration-none">Login</Link></p>
          </div>

          <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-white">Contact</h5>
            <p className="text-muted"><i className="bi bi-geo-alt-fill me-2"></i> Delhi, India</p>
            <p className="text-muted"><i className="bi bi-envelope-fill me-2"></i> support@smartblog.com</p>
            <p className="text-muted"><i className="bi bi-phone-fill me-2"></i> +91 98765 43210</p>
          </div>
          
        </div>

        <hr className="mb-4" />

        <div className="row align-items-center">
          <div className="col-md-7 col-lg-8">
            <p className="text-muted">
              © {new Date().getFullYear()} All rights reserved by:
              <strong className="text-primary text-decoration-none"> SmartBlog Project Team</strong>
            </p>
          </div>
          <div className="col-md-5 col-lg-4">
            <div className="text-md-right">
              <ul className="list-unstyled list-inline d-flex justify-content-start justify-content-md-end gap-3 mb-0">
                <li className="list-inline-item">
                  <a href="#" className="btn-floating btn-sm text-white" style={{ fontSize: '23px' }}><i className="bi bi-facebook"></i></a>
                </li>
                <li className="list-inline-item">
                  <a href="#" className="btn-floating btn-sm text-white" style={{ fontSize: '23px' }}><i className="bi bi-twitter-x"></i></a>
                </li>
                <li className="list-inline-item">
                  <a href="#" className="btn-floating btn-sm text-white" style={{ fontSize: '23px' }}><i className="bi bi-linkedin"></i></a>
                </li>
                <li className="list-inline-item">
                  <a href="#" className="btn-floating btn-sm text-white" style={{ fontSize: '23px' }}><i className="bi bi-github"></i></a>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
