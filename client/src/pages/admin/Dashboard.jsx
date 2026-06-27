import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  const isAdmin = user?.role === 'Admin';
  const isAdminOrEditor = user && ['Admin', 'Editor'].includes(user.role);

  // Helper to find max count for CSS bar charts
  const getMaxVal = (arr) => {
    if (!arr || arr.length === 0) return 1;
    const max = Math.max(...arr.map(item => item.count));
    return max === 0 ? 1 : max;
  };

  const blogsMax = data?.charts?.monthlyBlogs ? getMaxVal(data.charts.monthlyBlogs) : 1;
  const usersMax = data?.charts?.monthlyUsers ? getMaxVal(data.charts.monthlyUsers) : 1;
  const viewsMax = data?.charts?.monthlyViews ? getMaxVal(data.charts.monthlyViews) : 1;

  return (
    <div className="container-fluid">
      <div className="row">
        
        {/* Admin Navigation Sidebar */}
        <div className="col-md-3 col-lg-2 px-0 admin-sidebar d-none d-md-block shadow-sm">
          <div className="p-4 text-center border-bottom border-secondary mb-3">
            <span className="fw-bold text-white fs-5">{user?.role} Portal</span>
          </div>
          <ul className="nav nav-pills flex-column mb-auto">
            <li className="nav-item">
              <Link to="/admin/dashboard" className="nav-link active">
                <i className="bi bi-speedometer2 me-2"></i> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/blogs" className="nav-link">
                <i className="bi bi-journal-text me-2"></i> Blog Manager
              </Link>
            </li>
            {isAdminOrEditor && (
              <>
                <li>
                  <Link to="/admin/categories" className="nav-link">
                    <i className="bi bi-tags me-2"></i> Categories
                  </Link>
                </li>
                <li>
                  <Link to="/admin/comments" className="nav-link">
                    <i className="bi bi-chat-left-text me-2"></i> Comments
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link to="/admin/users" className="nav-link">
                      <i className="bi bi-people me-2"></i> User Manager
                    </Link>
                  </li>
                )}
                <li>
                  <Link to="/admin/contacts" className="nav-link">
                    <i className="bi bi-envelope me-2"></i> Contact Inquiries
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item mt-3">
              <span className="text-secondary small px-3 text-uppercase fw-bold">Assets</span>
            </li>
            <li>
              <Link to="/admin/media" className="nav-link">
                <i className="bi bi-images me-2"></i> Media Library
              </Link>
            </li>
            <li>
              <Link to="/profile" className="nav-link mt-4 text-secondary">
                <i className="bi bi-person-circle me-2"></i> View Profile
              </Link>
            </li>
          </ul>
        </div>

        {/* Dashboard Main Content */}
        <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2 fw-bold">Creator Dashboard</h1>
            <div className="btn-toolbar mb-2 mb-md-0">
              <Link to="/admin/blogs/new" className="btn btn-premium-primary rounded-3">
                <i className="bi bi-plus-lg me-2"></i> Write New Blog
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading dashboard stats...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Dashboard Metrics Grid */}
              <div className="row g-3 mb-4">
                {/* Total Blogs */}
                <div className="col-md-4 col-xl-2">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-primary border-4 h-100">
                    <span className="text-muted small fw-semibold">Total Blogs</span>
                    <h3 className="fw-bold mt-1 mb-0">{data?.counts?.totalBlogs}</h3>
                  </div>
                </div>
                {/* Published Blogs */}
                <div className="col-md-4 col-xl-2">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-success border-4 h-100">
                    <span className="text-muted small fw-semibold">Published Blogs</span>
                    <h3 className="fw-bold mt-1 mb-0">{data?.counts?.publishedBlogs}</h3>
                  </div>
                </div>
                {/* Draft Blogs */}
                <div className="col-md-4 col-xl-2">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-secondary border-4 h-100">
                    <span className="text-muted small fw-semibold">Draft Blogs</span>
                    <h3 className="fw-bold mt-1 mb-0">{data?.counts?.draftBlogs}</h3>
                  </div>
                </div>
                {/* Categories */}
                <div className="col-md-4 col-xl-2">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-info border-4 h-100">
                    <span className="text-muted small fw-semibold">Categories</span>
                    <h3 className="fw-bold mt-1 mb-0">{data?.counts?.totalCategories}</h3>
                  </div>
                </div>
                {/* Total Comments */}
                <div className="col-md-4 col-xl-2">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-warning border-4 h-100">
                    <span className="text-muted small fw-semibold">Total Comments</span>
                    <h3 className="fw-bold mt-1 mb-0">{data?.counts?.totalComments}</h3>
                  </div>
                </div>
                {/* Pending Comments */}
                <div className="col-md-4 col-xl-2">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-danger border-4 h-100">
                    <span className="text-muted small fw-semibold text-danger">Pending Comments</span>
                    <h3 className="fw-bold mt-1 mb-0 text-danger">{data?.counts?.pendingComments}</h3>
                  </div>
                </div>
              </div>

              {/* Users & Contacts Stats (Admins & Editors Only) */}
              <div className="row g-3 mb-5">
                {isAdminOrEditor && (
                  <>
                    <div className="col-md-4">
                      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-dark border-4 h-100">
                        <span className="text-muted small fw-semibold">Total Users</span>
                        <h4 className="fw-bold mt-1 mb-0">
                          {data?.counts?.totalUsers}{' '}
                          <span className="fs-6 fw-normal text-muted" style={{ fontSize: '12px' }}>
                            ({data?.counts?.totalAuthors} Authors / {data?.counts?.totalEditors} Editors)
                          </span>
                        </h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-purple border-4 h-100">
                        <span className="text-muted small fw-semibold">Contact Messages</span>
                        <h4 className="fw-bold mt-1 mb-0">{data?.counts?.contactMessages}</h4>
                      </div>
                    </div>
                  </>
                )}
                {/* Media Files Count Card */}
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-pink border-4 h-100" style={{ borderLeftColor: '#e02424' }}>
                    <span className="text-muted small fw-semibold">Media Files</span>
                    <h4 className="fw-bold mt-1 mb-0">{data?.counts?.totalMedia}</h4>
                  </div>
                </div>
              </div>

              {/* CSS Charts Row */}
              <div className="row g-4 mb-5">
                {/* Monthly Blogs Chart */}
                <div className="col-md-12 col-lg-4">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <h5 className="fw-bold mb-4"><i className="bi bi-bar-chart-fill text-primary me-2"></i> Monthly Blogs Created</h5>
                    <div className="d-flex align-items-end justify-content-between pt-4" style={{ height: '220px' }}>
                      {data?.charts?.monthlyBlogs?.map((item, idx) => (
                        <div key={idx} className="d-flex flex-column align-items-center flex-grow-1">
                          <span className="text-secondary small fw-bold mb-2">{item.count}</span>
                          <div 
                            className="bg-primary rounded-top" 
                            style={{ 
                              width: '24px', 
                              height: `${(item.count / blogsMax) * 150}px`,
                              minHeight: item.count > 0 ? '4px' : '0px',
                              background: 'linear-gradient(180deg, #4f46e5 0%, #7c3aed 100%)',
                              transition: 'height 0.5s ease-out'
                            }}
                          ></div>
                          <span className="text-muted small mt-2" style={{ fontSize: '10px' }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Monthly Users Chart */}
                <div className="col-md-12 col-lg-4">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <h5 className="fw-bold mb-4"><i className="bi bi-graph-up text-success me-2"></i> Monthly Registrations</h5>
                    <div className="d-flex align-items-end justify-content-between pt-4" style={{ height: '220px' }}>
                      {data?.charts?.monthlyUsers?.map((item, idx) => (
                        <div key={idx} className="d-flex flex-column align-items-center flex-grow-1">
                          <span className="text-secondary small fw-bold mb-2">{item.count}</span>
                          <div 
                            className="bg-success rounded-top" 
                            style={{ 
                              width: '24px', 
                              height: `${(item.count / usersMax) * 150}px`,
                              minHeight: item.count > 0 ? '4px' : '0px',
                              background: 'linear-gradient(180deg, #06b6d4 0%, #3b82f6 100%)',
                              transition: 'height 0.5s ease-out'
                            }}
                          ></div>
                          <span className="text-muted small mt-2" style={{ fontSize: '10px' }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Monthly Views Chart */}
                <div className="col-md-12 col-lg-4">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <h5 className="fw-bold mb-4"><i className="bi bi-eye-fill text-info me-2"></i> Monthly Blog Views</h5>
                    <div className="d-flex align-items-end justify-content-between pt-4" style={{ height: '220px' }}>
                      {data?.charts?.monthlyViews?.map((item, idx) => (
                        <div key={idx} className="d-flex flex-column align-items-center flex-grow-1">
                          <span className="text-secondary small fw-bold mb-2">{item.count}</span>
                          <div 
                            className="bg-info rounded-top" 
                            style={{ 
                              width: '24px', 
                              height: `${(item.count / viewsMax) * 150}px`,
                              minHeight: item.count > 0 ? '4px' : '0px',
                              background: 'linear-gradient(180deg, #0d9488 0%, #0f766e 100%)',
                              transition: 'height 0.5s ease-out'
                            }}
                          ></div>
                          <span className="text-muted small mt-2" style={{ fontSize: '10px' }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Aggregation Rankings Grid */}
              <div className="row g-4 mb-5">
                {/* Top Categories */}
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <h5 className="fw-bold mb-3"><i className="bi bi-tag-fill text-info me-2"></i> Top Categories</h5>
                    <ul className="list-group list-group-flush">
                      {data?.charts?.topCategories?.map((item, idx) => (
                        <li key={idx} className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center border-0 border-bottom">
                          <span className="fw-semibold text-dark">{idx + 1}. {item.name}</span>
                          <span className="badge bg-primary rounded-pill px-3 py-2">{item.count} Blogs</span>
                        </li>
                      ))}
                      {(!data?.charts?.topCategories || data.charts.topCategories.length === 0) && (
                        <p className="text-muted mt-2">No category logs available.</p>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Most Active Authors */}
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <h5 className="fw-bold mb-3"><i className="bi bi-people-fill text-warning me-2"></i> Most Active Authors</h5>
                    <ul className="list-group list-group-flush">
                      {data?.charts?.activeAuthors?.map((item, idx) => (
                        <li key={idx} className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center border-0 border-bottom">
                          <span className="fw-semibold text-dark">{idx + 1}. {item.name}</span>
                          <span className="badge bg-success rounded-pill px-3 py-2">{item.count} Posts</span>
                        </li>
                      ))}
                      {(!data?.charts?.activeAuthors || data.charts.activeAuthors.length === 0) && (
                        <p className="text-muted mt-2">No active authors available.</p>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* View/Comment Analytics Tables */}
              <div className="row g-4 mb-5">
                {/* Most Viewed Blogs */}
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <h5 className="fw-bold mb-3"><i className="bi bi-eye-fill text-primary me-2"></i> Most Viewed Blogs</h5>
                    <div className="table-responsive">
                      <table className="table align-middle table-hover table-sm mb-0" style={{ fontSize: '13px' }}>
                        <thead className="table-light">
                          <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th className="text-end">Views</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data?.mostViewedBlogs?.map((blog) => (
                            <tr key={blog._id}>
                              <td className="text-truncate" style={{ maxWidth: '180px' }}>
                                <Link to={`/blogs/${blog.slug}`} className="text-dark fw-semibold text-decoration-none">
                                  {blog.title}
                                </Link>
                              </td>
                              <td>{blog.category?.name || 'Uncategorized'}</td>
                              <td className="text-end fw-bold text-primary">{blog.views}</td>
                            </tr>
                          ))}
                          {(!data?.mostViewedBlogs || data.mostViewedBlogs.length === 0) && (
                            <tr><td colSpan="3" className="text-muted text-center py-2">No data</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Most Commented Blogs */}
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <h5 className="fw-bold mb-3"><i className="bi bi-chat-left-dots-fill text-warning me-2"></i> Most Commented Blogs</h5>
                    <div className="table-responsive">
                      <table className="table align-middle table-hover table-sm mb-0" style={{ fontSize: '13px' }}>
                        <thead className="table-light">
                          <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th className="text-end">Comments</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data?.mostCommentedBlogs?.map((blog) => (
                            <tr key={blog._id}>
                              <td className="text-truncate" style={{ maxWidth: '180px' }}>
                                <Link to={`/blogs/${blog.slug}`} className="text-dark fw-semibold text-decoration-none">
                                  {blog.title}
                                </Link>
                              </td>
                              <td>{blog.category?.name || 'Uncategorized'}</td>
                              <td className="text-end fw-bold text-warning">{blog.commentCount || 0}</td>
                            </tr>
                          ))}
                          {(!data?.mostCommentedBlogs || data.mostCommentedBlogs.length === 0) && (
                            <tr><td colSpan="3" className="text-muted text-center py-2">No data</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Latest records Grid */}
              <div className="row g-4 mb-5">
                {/* Latest Users */}
                {isAdminOrEditor && (
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                      <h5 className="fw-bold mb-3"><i className="bi bi-person-plus-fill text-success me-2"></i> Latest Registered Users</h5>
                      <div className="table-responsive">
                        <table className="table align-middle table-hover table-sm mb-0" style={{ fontSize: '13px' }}>
                          <thead className="table-light">
                            <tr>
                              <th>Name</th>
                              <th>Role</th>
                              <th className="text-end">Joined</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data?.latestUsers?.map((u) => (
                              <tr key={u._id}>
                                <td className="fw-bold">{u.name}</td>
                                <td><span className="badge bg-secondary">{u.role}</span></td>
                                <td className="text-end text-muted small">{new Date(u.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                            {(!data?.latestUsers || data.latestUsers.length === 0) && (
                              <tr><td colSpan="3" className="text-muted text-center py-2">No users</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Latest Comments */}
                <div className={isAdminOrEditor ? 'col-md-6' : 'col-md-12'}>
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <h5 className="fw-bold mb-3"><i className="bi bi-chat-right-text-fill text-danger me-2"></i> Latest Comments</h5>
                    <div className="table-responsive">
                      <table className="table align-middle table-hover table-sm mb-0" style={{ fontSize: '13px' }}>
                        <thead className="table-light">
                          <tr>
                            <th>User</th>
                            <th>Comment</th>
                            <th className="text-end">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data?.latestComments?.map((comment) => (
                            <tr key={comment._id}>
                              <td className="fw-bold">{comment.userId?.name || 'Visitor'}</td>
                              <td className="text-truncate text-secondary" style={{ maxWidth: '180px' }} title={comment.comment}>
                                {comment.comment}
                              </td>
                              <td className="text-end text-muted small">{new Date(comment.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                          {(!data?.latestComments || data.latestComments.length === 0) && (
                            <tr><td colSpan="3" className="text-muted text-center py-2">No comments</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Combined Timeline & Recent Activity */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <h5 className="fw-bold mb-4"><i className="bi bi-list-stars text-danger me-2"></i> Recent Activity Log</h5>
                {data?.timeline && data.timeline.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {data.timeline.map((item, idx) => (
                      <div key={idx} className="list-group-item border-0 px-0 py-3 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <div className={`rounded-circle p-2 bg-opacity-10 ${item.type === 'blog' ? 'bg-primary text-primary' : item.type === 'comment' ? 'bg-warning text-warning' : 'bg-info text-info'}`}>
                            <i className={`bi ${item.type === 'blog' ? 'bi-journal-plus' : item.type === 'comment' ? 'bi-chat-left-text' : 'bi-envelope'}`}></i>
                          </div>
                          <div>
                            <span className="d-block fw-bold text-dark">{item.message}</span>
                            <small className="text-muted">Activity recorded</small>
                          </div>
                        </div>
                        <span className="text-secondary small">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0">No activities recorded yet.</p>
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
