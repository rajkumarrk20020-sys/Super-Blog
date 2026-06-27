import React, { useEffect, useRef, useState } from 'react';

const About = () => {
  const steps = ['Idea', 'Design', 'Development', 'Launch', 'Community', 'Future'];
  const trackRef = useRef(null);
  const itemRefs = useRef([]);
  const [counters, setCounters] = useState({ articles: 0, authors: 0, categories: 0, readers: 0 });

  useEffect(() => {
    // Timeline intersection observer
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in-view');
        });
      },
      { threshold: 0.35 }
    );
    itemRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    // Animated counters
    const targets = { articles: 3421, authors: 128, categories: 42, readers: 123456 };
    const duration = 1800;
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // simple ease
      setCounters({
        articles: Math.floor(targets.articles * eased),
        authors: Math.floor(targets.authors * eased),
        categories: Math.floor(targets.categories * eased),
        readers: Math.floor(targets.readers * eased),
      });
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, []);

  return (
    <div className="container">
      {/* Hero */}
      <section className="about-hero">
        <div className="label">ABOUT SMARTBLOG</div>
        <h1 className="fw-extrabold">Where Great Ideas Become Meaningful Stories</h1>
        <p className="lead">We believe thoughtful writing deserves elegant presentation. SmartBlog combines editorial focus with modern tooling — built for readers and creators who value clarity, craft and community.</p>
        <div className="hero-ctas">
          <button className="btn-premium-primary">Start Reading</button>
          <button className="btn-premium-secondary">Become an Author</button>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mb-5">
        <div className="d-flex mission-cards">
          <div className="premium-card mission-card">
            <div className="icon"><i className="bi bi-square-fill"></i></div>
            <h4 className="fw-bold">Our Mission</h4>
            <p className="text-muted">To elevate meaningful writing by providing creators a refined platform to craft stories, connect with readers, and build thoughtful communities.</p>
          </div>
          <div className="premium-card mission-card">
            <div className="icon"><i className="bi bi-eye-fill"></i></div>
            <h4 className="fw-bold">Our Vision</h4>
            <p className="text-muted">To be the home for long-form clarity — where ideas are nurtured, conversations deepen, and impact grows over time.</p>
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="timeline">
        <div className="position-relative">
          <div className="timeline-line"></div>
          <div className="timeline-track" ref={trackRef}>
            {steps.map((s, i) => (
              <div
                key={s}
                ref={(el) => (itemRefs.current[i] = el)}
                className="timeline-item"
                style={{ padding: '1rem' }}
              >
                <div className="dot">{i + 1}</div>
                <div className="fw-semibold mt-2">{s}</div>
                <div className="text-muted small">{s === 'Idea' ? 'Spark' : s === 'Future' ? 'Next' : 'Phase'}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Readers Choose SmartBlog */}
      <section className="why-choose row align-items-center g-5">
        <div className="col-lg-6">
          <div className="premium-card">
            {/* Simple dashboard illustration (SVG) */}
            <svg width="100%" height="220" viewBox="0 0 800 360" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="dashboard illustration">
              <rect x="12" y="12" width="776" height="336" rx="18" fill="#f8fafc" stroke="#eef2ff" />
              <rect x="48" y="52" width="220" height="160" rx="10" fill="#eef2ff" />
              <rect x="292" y="52" width="420" height="28" rx="8" fill="#eef2ff" />
              <rect x="292" y="96" width="420" height="120" rx="8" fill="#fff" stroke="#eef2ff" />
            </svg>
          </div>
        </div>
        <div className="col-lg-6">
          <h3 className="fw-bold">Why Readers Choose SmartBlog</h3>
          <p className="text-muted">Designed to minimize noise and maximize reading focus — curated layouts, fast performance, and thoughtful recommendations.</p>
          <div className="checklist">
            <div className="check-item">
              <div className="check-icon"><i className="bi bi-check-lg"></i></div>
              <div>
                <h6 className="fw-semibold mb-0">Focused Reading Experience</h6>
                <small className="text-muted">No clutter, just clear typography and rhythm.</small>
              </div>
            </div>
            <div className="check-item">
              <div className="check-icon"><i className="bi bi-shield-lock-fill"></i></div>
              <div>
                <h6 className="fw-semibold mb-0">Safe & Private</h6>
                <small className="text-muted">Respectful defaults for readers and authors.</small>
              </div>
            </div>
            <div className="check-item">
              <div className="check-icon"><i className="bi bi-people-fill"></i></div>
              <div>
                <h6 className="fw-semibold mb-0">Curated Community</h6>
                <small className="text-muted">Discover voices that matter.</small>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button className="btn-premium-primary">Explore Articles</button>
          </div>
        </div>
      </section>

      {/* Growing Together / Stats */}
      <section className="stats">
        <div className="stats-grid">
          <div className="stat">
            <div className="num">{counters.articles.toLocaleString()}</div>
            <div className="label">Articles</div>
          </div>
          <div className="stat">
            <div className="num">{counters.authors}</div>
            <div className="label">Authors</div>
          </div>
          <div className="stat">
            <div className="num">{counters.categories}</div>
            <div className="label">Categories</div>
          </div>
          <div className="stat">
            <div className="num">{counters.readers.toLocaleString()}</div>
            <div className="label">Monthly Readers</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <h3 className="fw-bold">Ready to Share Your Story?</h3>
        <p className="mb-3 text-white-50">Join a thoughtful community of writers and readers. Publish with elegance.</p>
        <div className="d-flex justify-content-center gap-3">
          <button className="btn-premium-primary">Start Writing</button>
          <button className="btn btn-outline-light">Contact Us</button>
        </div>
      </section>
    </div>
  );
};

export default About;
