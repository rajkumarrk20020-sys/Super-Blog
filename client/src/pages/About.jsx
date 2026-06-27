import React from 'react';

const About = () => {
  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-extrabold mb-3">About <span className="text-gradient">SmartBlog</span></h1>
        <p className="lead text-muted max-w-2xl mx-auto">
          An advanced, production-ready Blog Management System developed as an MCA Major Project.
        </p>
      </div>

      {/* Main Info */}
      <div className="row align-items-center g-5 mb-5">
        <div className="col-lg-6">
          <h2 className="fw-bold mb-4">Project Objective</h2>
          <p className="text-secondary lh-lg mb-3">
            SmartBlog is designed to fulfill the requirements of a modern web application. It features a complete MVC backend architecture, secure token-based authentication, and a responsive frontend user interface styled with Bootstrap 5.
          </p>
          <p className="text-secondary lh-lg mb-4">
            The platform supports three distinct roles (Visitor, Author, Admin) allowing seamless workflows for article creation, comment moderation, category organization, and inquiry management.
          </p>
          <div className="row g-3">
            <div className="col-6">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-shield-check text-primary fs-3"></i>
                <div>
                  <h6 className="fw-bold mb-0">Secure JWT</h6>
                  <small className="text-muted">Encrypted logins</small>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-people-fill text-primary fs-3"></i>
                <div>
                  <h6 className="fw-bold mb-0">Role Management</h6>
                  <small className="text-muted">Granular access</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="bg-white p-5 rounded-4 shadow-sm border border-light">
            <h4 className="fw-bold mb-4 text-primary">Academic Information</h4>
            <table className="table table-borderless mb-0">
              <tbody>
                <tr>
                  <th scope="row" className="ps-0 text-dark fw-semibold" style={{ width: '40%' }}>Project Name:</th>
                  <td className="text-secondary">SmartBlog System</td>
                </tr>
                <tr>
                  <th scope="row" className="ps-0 text-dark fw-semibold">Course:</th>
                  <td className="text-secondary">MCA Major Project</td>
                </tr>
                <tr>
                  <th scope="row" className="ps-0 text-dark fw-semibold">Database:</th>
                  <td className="text-secondary">MongoDB (Mongoose)</td>
                </tr>
                <tr>
                  <th scope="row" className="ps-0 text-dark fw-semibold">Backend Framework:</th>
                  <td className="text-secondary">Express.js (Node.js)</td>
                </tr>
                <tr>
                  <th scope="row" className="ps-0 text-dark fw-semibold">Frontend Library:</th>
                  <td className="text-secondary">React.js (Vite)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tech Stack details */}
      <div className="bg-white p-5 rounded-4 shadow-sm mb-5 border border-light">
        <h3 className="fw-bold text-center mb-5">Tech Stack & Tools</h3>
        <div className="row g-4 text-center">
          <div className="col-md-3">
            <div className="p-3 border rounded-3 h-100">
              <i className="bi bi-filetype-jsx text-info fs-1 d-block mb-3"></i>
              <h5 className="fw-bold">React.js (Vite)</h5>
              <p className="text-muted small mb-0">High-performance SPA library with fast bundling.</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 border rounded-3 h-100">
              <i className="bi bi-server text-success fs-1 d-block mb-3"></i>
              <h5 className="fw-bold">Node.js + Express</h5>
              <p className="text-muted small mb-0">Fast RESTful API backend structured with MVC pattern.</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 border rounded-3 h-100">
              <i className="bi bi-database-fill text-success fs-1 d-block mb-3"></i>
              <h5 className="fw-bold">MongoDB</h5>
              <p className="text-muted small mb-0">NoSQL document store utilizing Mongoose schemas.</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 border rounded-3 h-100">
              <i className="bi bi-bootstrap-fill text-purple fs-1 d-block mb-3" style={{ color: '#7952b3' }}></i>
              <h5 className="fw-bold">Bootstrap 5</h5>
              <p className="text-muted small mb-0">Sleek styling grid for a premium responsive layout.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
