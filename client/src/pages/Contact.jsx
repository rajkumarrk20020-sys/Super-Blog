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
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="row g-0">
              
              {/* Form Section */}
              <div className="col-md-6 p-5">
                <h2 className="fw-bold mb-3">Get in Touch</h2>
                <p className="text-muted mb-4">Submit your question, feature request, or feedback. We respond within 24 hours.</p>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control form-control-premium"
                      placeholder="John Doe"
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
                      placeholder="john@example.com"
                      value={email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      className="form-control form-control-premium"
                      placeholder="Inquiry Subject"
                      value={subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Message</label>
                    <textarea
                      name="message"
                      className="form-control form-control-premium"
                      rows="4"
                      placeholder="Write your details..."
                      value={message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                  
                  <button type="submit" className="btn btn-premium-primary w-100 py-2" disabled={loading}>
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

              {/* Info Sidebar Section */}
              <div className="col-md-6 bg-dark text-white p-5 d-flex flex-column justify-content-center" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                <h3 className="fw-bold mb-4 text-gradient">SmartBlog Headquarters</h3>
                <p className="text-muted lh-lg mb-5">
                  If you have project submission questions, feedback on the code, or are looking for development partnerships, reach out directly.
                </p>
                <div className="d-flex flex-column gap-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-primary bg-opacity-20 d-flex align-items-center justify-content-center text-primary" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                      <i className="bi bi-geo-alt-fill fs-5"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">Location</h6>
                      <small className="text-muted">Delhi, India</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-primary bg-opacity-20 d-flex align-items-center justify-content-center text-primary" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                      <i className="bi bi-envelope-fill fs-5"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">Email Address</h6>
                      <small className="text-muted">support@smartblog.com</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-primary bg-opacity-20 d-flex align-items-center justify-content-center text-primary" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                      <i className="bi bi-telephone-fill fs-5"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">Phone Number</h6>
                      <small className="text-muted">+91 98765 43210</small>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
