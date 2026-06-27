import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let mounted = true;
    axios.get('/api/categories').then(res => {
      if (!mounted) return;
      if (res.data?.success) setCategories(res.data.data || []);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    if (input) input.value = '';
    // UI-only subscribe
    alert('Thanks — subscription submitted (UI only).');
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <div className="newsletter-section py-5">
        <div className="container">
          <div className="newsletter-card p-4 rounded-4 d-flex align-items-center justify-content-between">
            <div className="d-flex gap-3 align-items-center">
              <div className="newsletter-illustration" aria-hidden>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="#EEF2FF"/><path d="M7 11l3 3 7-7" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <h4 className="fw-bold mb-1">Never Miss a Great Story</h4>
                <p className="mb-0">Subscribe to receive the latest articles, technology insights, product discussions, and developer stories directly in your inbox.</p>
              </div>
            </div>
            <form className="d-flex gap-2 align-items-center" onSubmit={handleSubscribe} style={{ minWidth: 280 }}>
              <input type="email" className="form-control form-control-premium" placeholder="Your email address" aria-label="Email" />
              <button className="btn btn-premium-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      <footer className="site-footer compact-footer mt-auto" role="contentinfo">
        <div className="container">
          <div className="row gy-3 align-items-start footer-top">
            <div className="col-lg-4 col-md-6">
              <div className="brand">
                <h5 className="mb-2">SMARTBLOG</h5>
                <p className="small mb-2">SmartBlog is a modern editorial platform where developers, creators, entrepreneurs, and curious minds share ideas, tell stories, and inspire meaningful conversations.</p>
                <span className="badge bg-light rounded-pill text-dark small">Modern Editorial Platform</span>
              </div>
            </div>

            {categories && categories.length > 0 && (
              <div className="col-lg-3 col-md-6">
                <h6 className="mb-2">Categories</h6>
                <div className="d-flex flex-wrap gap-2">
                  {categories.slice(0, 12).map(cat => (
                    <Link key={cat._id} to={`/blogs?category=${cat.slug}`} className="category-pill" title={cat.name} aria-label={`Category ${cat.name}`}>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className={`col-lg-${categories && categories.length > 0 ? '3' : '4'} col-md-6`}>
              <h6 className="mb-2">Quick Links</h6>
              <ul className="list-unstyled mb-0 footer-links">
                <li><Link to="/" className="footer-link"><i className="bi bi-chevron-right footer-link-icon" aria-hidden></i>Home</Link></li>
                <li><Link to="/blogs" className="footer-link"><i className="bi bi-chevron-right footer-link-icon" aria-hidden></i>Blogs</Link></li>
                <li><Link to="/about" className="footer-link"><i className="bi bi-chevron-right footer-link-icon" aria-hidden></i>About Us</Link></li>
                <li><Link to="/contact" className="footer-link"><i className="bi bi-chevron-right footer-link-icon" aria-hidden></i>Contact Us</Link></li>
                <li><Link to="/login" className="footer-link"><i className="bi bi-chevron-right footer-link-icon" aria-hidden></i>Login</Link></li>
                <li><Link to="/register" className="footer-link"><i className="bi bi-chevron-right footer-link-icon" aria-hidden></i>Register</Link></li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-6">
              <h6 className="mb-2">Contact</h6>
              <ul className="list-unstyled mb-0 contact-list">
                <li><a href="mailto:support@smartblog.com" className="footer-link"><i className="bi bi-envelope-fill me-2" aria-hidden></i>support@smartblog.com</a></li>
              </ul>
            </div>
          </div>

          <hr className="footer-divider my-3" />

          <div className="d-flex align-items-center justify-content-between footer-bottom">
            <div className="small">© 2026 SmartBlog. All Rights Reserved.</div>
            <div className="d-flex align-items-center gap-2">
              <a href="#" className="social-btn" aria-label="facebook"><i className="bi bi-facebook"></i></a>
              <a href="#" className="social-btn" aria-label="twitter"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="social-btn" aria-label="linkedin"><i className="bi bi-linkedin"></i></a>
              <a href="#" className="social-btn" aria-label="github"><i className="bi bi-github"></i></a>
              <button onClick={scrollToTop} className="btn btn-sm btn-outline-light back-to-top-footer" aria-label="Back to top">Top</button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
