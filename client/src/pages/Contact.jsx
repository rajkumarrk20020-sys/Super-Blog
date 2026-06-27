import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Contact = () => {
  const { showToast } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const { name, email, subject, message } = formData;
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post('/api/contact', formData);
      if (res.data.success) {
        showToast('Your message has been submitted. We will contact you soon.', 'success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to submit inquiry.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      {/* HERO */}
      <section className="contact-hero">
        <div className="label">CONTACT SMARTBLOG</div>
        <h1 className="fw-extrabold">Let's Build Meaningful Conversations</h1>
        <p>Whether you have a question, partnership opportunity, feature suggestion, or simply want to say hello, we'd love to hear from you.</p>
        <div className="d-flex justify-content-center gap-3">
          <a href="#contact-form" className="btn btn-premium-primary">Send Message</a>
          <a href="/" className="btn btn-premium-secondary">Browse Articles</a>
        </div>
        <div className="hero-illustration">
          {/* Decorative illustration for desktop */}
          <svg width="420" height="140" viewBox="0 0 840 280" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
            <rect x="10" y="10" width="820" height="260" rx="18" fill="#f8fafc" stroke="#eef2ff" />
            <circle cx="120" cy="140" r="40" fill="#eef2ff" />
            <rect x="200" y="70" width="420" height="20" rx="8" fill="#eef2ff" />
            <rect x="200" y="105" width="320" height="18" rx="8" fill="#fff" stroke="#eef2ff" />
          </svg>
        </div>

      </section>

      {/* Contact + Form */}
      <section className="contact-wrapper">
        <div className="contact-card">
          <div className="row g-0">
            {/* LEFT: Contact Info */}
            <div className="col-lg-5 contact-info p-4">
              <h4 className="fw-bold">Contact Information</h4>
              <p className="text-muted">Reach out to the right team — we're here to help and collaborate.</p>

              <div className="info-item">
                <div className="icon-box"><i className="bi bi-geo-alt-fill"></i></div>
                <div>
                  <div className="fw-semibold">Office</div>
                  <small className="text-muted">Delhi, India</small>
                </div>
              </div>

              <div className="info-item">
                <div className="icon-box"><i className="bi bi-envelope-fill"></i></div>
                <div>
                  <div className="fw-semibold">Email</div>
                  <small className="text-muted">support@smartblog.com</small>
                </div>
              </div>

              <div className="info-item">
                <div className="icon-box"><i className="bi bi-telephone-fill"></i></div>
                <div>
                  <div className="fw-semibold">Phone</div>
                  <small className="text-muted">+91 98765 43210</small>
                </div>
              </div>

              <div className="info-item">
                <div className="icon-box"><i className="bi bi-clock-fill"></i></div>
                <div>
                  <div className="fw-semibold">Working Hours</div>
                  <small className="text-muted">Mon — Fri, 9:00 — 18:00 IST</small>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <div className="d-flex gap-2">
                  <a href="#" className="btn btn-light rounded-pill">Twitter</a>
                  <a href="#" className="btn btn-light rounded-pill">LinkedIn</a>
                  <a href="#" className="btn btn-light rounded-pill">GitHub</a>
                </div>
              </div>
            </div>

            {/* RIGHT: Form */}
            <div className="col-lg-7 form-panel" id="contact-form">
              <h3 className="fw-bold mb-2">Send us a message</h3>
              <p className="text-muted mb-4">Fill out the form and our team will get back to you shortly.</p>

              <form onSubmit={handleSubmit}>
                <div className="form-floating-custom">
                  <input type="text" name="name" value={name} onChange={handleChange} required placeholder=" " />
                  <label>Your Name</label>
                </div>

                <div className="form-floating-custom">
                  <input type="email" name="email" value={email} onChange={handleChange} required placeholder=" " />
                  <label>Email Address</label>
                </div>

                <div className="form-floating-custom">
                  <input type="text" name="subject" value={subject} onChange={handleChange} required placeholder=" " />
                  <label>Subject</label>
                </div>

                <div className="form-floating-custom">
                  <textarea name="message" value={message} onChange={handleChange} required placeholder=" "></textarea>
                  <label>Message</label>
                </div>

                <button type="submit" className="btn btn-premium-primary send-btn w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Sending Message...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* WHY CONTACT US / Features */}
        <div className="mt-4">
          <h5 className="fw-bold">Why Contact Us</h5>
          <div className="features">
            <div className="feature">
              <div className="feat-icon"><i className="bi bi-life-preserver"></i></div>
              <div>
                <div className="fw-semibold">Technical Support</div>
                <small className="text-muted">Help with integration and bugs.</small>
              </div>
            </div>
            <div className="feature">
              <div className="feat-icon"><i className="bi bi-briefcase-fill"></i></div>
              <div>
                <div className="fw-semibold">Business Inquiry</div>
                <small className="text-muted">Partnerships, licensing, and commercial questions.</small>
              </div>
            </div>
            <div className="feature">
              <div className="feat-icon"><i className="bi bi-people-fill"></i></div>
              <div>
                <div className="fw-semibold">Partnership</div>
                <small className="text-muted">Collaborate on content and projects.</small>
              </div>
            </div>
            <div className="feature">
              <div className="feat-icon"><i className="bi bi-chat-dots-fill"></i></div>
              <div>
                <div className="fw-semibold">Feedback & Suggestions</div>
                <small className="text-muted">Product ideas and UX feedback.</small>
              </div>
            </div>
            <div className="feature">
              <div className="feat-icon"><i className="bi bi-pencil-square"></i></div>
              <div>
                <div className="fw-semibold">Content Collaboration</div>
                <small className="text-muted">Co-authorship and guest posts.</small>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="faq">
          <h5 className="fw-bold">Frequently Asked Questions</h5>
          <div className="mt-3">
            {[
              { q: 'How quickly do you respond?', a: 'We typically respond within 24–48 hours for general inquiries.' },
              { q: 'Can I become an author?', a: 'Yes — send us a sample and a short bio; we review submissions regularly.' },
              { q: 'Can I advertise?', a: 'We evaluate commercial partnerships case-by-case; contact our business team.' },
              { q: 'How can I report an issue?', a: 'Please include a detailed description and any reproducible steps in your message.' },
            ].map((faq, idx) => (
              <div key={idx} className="faq-item">
                <div className="faq-question" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                  <div>{faq.q}</div>
                  <div>{openFaq === idx ? <i className="bi bi-dash-lg"></i> : <i className="bi bi-plus-lg"></i>}</div>
                </div>
                {openFaq === idx && <div className="faq-answer">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Map / Location */}
        <div className="mt-3">
          <h5 className="fw-bold">Our Location</h5>
          <div className="map-card mt-2">
            {/* Placeholder illustration */}
            <svg width="100%" height="220" viewBox="0 0 800 360" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="office location">
              <rect x="12" y="12" width="776" height="336" rx="18" fill="#fff" stroke="#eef2ff" />
              <rect x="40" y="44" width="200" height="120" rx="8" fill="#eef2ff" />
              <rect x="268" y="64" width="420" height="28" rx="8" fill="#eef2ff" />
              <circle cx="600" cy="220" r="28" fill="#eef2ff" />
            </svg>
          </div>
        </div>

        {/* Final CTA */}
        <div className="final-cta-contact">
          <h4 className="fw-bold">Join the SmartBlog Community</h4>
          <p>Connect with thousands of readers, creators, and developers sharing ideas every day.</p>
          <div className="d-flex justify-content-center gap-3">
            <a href="/" className="btn btn-light">Start Reading</a>
            <a href="/register" className="btn btn-outline-light">Become an Author</a>
          </div>
        </div>

      </section>
    </div>
  );
};

export default Contact;
