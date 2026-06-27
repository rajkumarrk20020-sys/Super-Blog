import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';

const CommentModerator = () => {
  const { token, showToast, user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & pagination states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [blogId, setBlogId] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBlogs = async () => {
    try {
      const res = await api.get('/blogs?limit=100');
      if (res.data.success) {
        setBlogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load blogs for selection filter', err);
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/comments?page=${page}&limit=10&search=${encodeURIComponent(search)}&status=${status}&blogId=${blogId}&sortBy=${sortBy}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setComments(res.data.data);
        setPages(res.data.pagination.pages);
        setTotal(res.data.pagination.total);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load comments list.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBlogs();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchComments();
    }
  }, [token, page, status, blogId, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComments();
  };

  const handleModerate = async (id, newStatus) => {
    try {
      const res = await api.put(
        `/comments/${id}/moderate`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showToast(`Comment status updated to ${newStatus}.`, 'success');
        setComments(
          comments.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update comment status.', 'danger');
    }
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm('Are you sure you want to soft delete this comment? It will be hidden from the website.')) return;

    try {
      const res = await api.delete(`/comments/${id}/soft`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showToast('Comment soft deleted.', 'success');
        setComments(
          comments.map((c) => (c._id === id ? { ...c, isDeleted: true } : c))
        );
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to soft delete comment.', 'danger');
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await api.put(
        `/comments/${id}/restore`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showToast('Comment restored successfully.', 'success');
        setComments(
          comments.map((c) => (c._id === id ? { ...c, isDeleted: false } : c))
        );
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to restore comment.', 'danger');
    }
  };

  const handlePin = async (id) => {
    try {
      const res = await api.put(
        `/comments/${id}/pin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showToast(res.data.message, 'success');
        // Unpin others on same blog, set this one to its new state
        const updatedComment = res.data.data;
        setComments(
          comments.map((c) => {
            if (c._id === id) {
              return { ...c, isPinned: updatedComment.isPinned };
            }
            if (c.blogId?._id === updatedComment.blogId && updatedComment.isPinned) {
              return { ...c, isPinned: false };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to toggle pin state.', 'danger');
    }
  };

  const handleHardDelete = async (id) => {
    if (!window.confirm('WARNING: Are you sure you want to permanently hard delete this comment from the database? This action is irreversible.')) return;

    try {
      const res = await api.delete(`/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showToast('Comment permanently deleted.', 'success');
        setComments(comments.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete comment.', 'danger');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setBlogId('');
    setSortBy('newest');
    setPage(1);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 px-0 admin-sidebar d-none d-md-block shadow-sm">
          <div className="p-4 text-center border-bottom border-secondary mb-3">
            <span className="fw-bold text-white fs-5">{user?.role} Portal</span>
          </div>
          <ul className="nav nav-pills flex-column mb-auto">
            <li>
              <Link to="/admin/dashboard" className="nav-link">
                <i className="bi bi-speedometer2 me-2"></i> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/blogs" className="nav-link">
                <i className="bi bi-journal-text me-2"></i> Blog Manager
              </Link>
            </li>
            <li>
              <Link to="/admin/categories" className="nav-link">
                <i className="bi bi-tags me-2"></i> Categories
              </Link>
            </li>
            <li>
              <Link to="/admin/comments" className="nav-link active">
                <i className="bi bi-chat-left-text me-2"></i> Comments
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className="nav-link">
                <i className="bi bi-people me-2"></i> User Manager
              </Link>
            </li>
            <li>
              <Link to="/admin/contacts" className="nav-link">
                <i className="bi bi-envelope me-2"></i> Contact Inquiries
              </Link>
            </li>
            <li>
              <Link to="/profile" className="nav-link mt-4 text-secondary">
                <i className="bi bi-person-circle me-2"></i> View Profile
              </Link>
            </li>
          </ul>
        </div>

        {/* Comments main content */}
        <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2 fw-bold">Moderate Comments</h1>
            <span className="text-muted fw-medium">{total} total comments</span>
          </div>

          {/* Search & Filters Sidebar Card */}
          <div className="card border-0 shadow-sm p-4 rounded-4 mb-4 bg-white">
            <form onSubmit={handleSearchSubmit}>
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label fw-semibold small">Search text</label>
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="Comment text..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className="btn btn-primary" type="submit">
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                </div>

                <div className="col-md-2">
                  <label className="form-label fw-semibold small">Status</label>
                  <select
                    className="form-select form-select-sm rounded-3"
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  >
                    <option value="">All Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold small">Article</label>
                  <select
                    className="form-select form-select-sm rounded-3 text-truncate"
                    value={blogId}
                    onChange={(e) => { setBlogId(e.target.value); setPage(1); }}
                  >
                    <option value="">All Articles</option>
                    {blogs.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="form-label fw-semibold small">Sort By</label>
                  <select
                    className="form-select form-select-sm rounded-3"
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="mostLiked">Most Liked</option>
                    <option value="mostReported">Most Reported</option>
                  </select>
                </div>

                <div className="col-md-1">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary w-100 rounded-3"
                    onClick={handleClearFilters}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading comments...</span>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              {comments.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <table className="table align-middle table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Commenter</th>
                          <th>Article</th>
                          <th>Comment Text</th>
                          <th>Status</th>
                          <th>Stats</th>
                          <th>Tags</th>
                          <th>Created At</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comments.map((item) => (
                          <tr key={item._id} className={item.isDeleted ? 'table-warning opacity-75' : ''}>
                            <td>
                              <span className="d-block fw-bold">{item.userId?.name || 'Deleted User'}</span>
                              <span className="text-muted small" style={{ fontSize: '11px' }}>{item.userId?.email || 'N/A'}</span>
                            </td>
                            <td>
                              {item.blogId ? (
                                <Link to={`/blogs/${item.blogId.slug}`} className="text-dark fw-semibold text-decoration-none text-truncate d-inline-block" style={{ maxWidth: '180px' }}>
                                  {item.blogId.title}
                                </Link>
                              ) : (
                                <span className="text-muted">Deleted Article</span>
                              )}
                            </td>
                            <td className="text-secondary" style={{ maxWidth: '250px', whiteSpace: 'normal', fontSize: '13px' }}>
                              {item.isDeleted ? (
                                <span className="text-muted fst-italic"><i className="bi bi-trash3 me-1"></i> [Soft Deleted] {item.comment}</span>
                              ) : (
                                item.comment
                              )}
                            </td>
                            <td>
                              <span className={`badge rounded-pill px-3 py-2 ${item.status === 'Approved' ? 'bg-success' : item.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="small text-secondary">
                              <div className="d-flex flex-column" style={{ fontSize: '11px' }}>
                                <span>Likes: {item.likeCount || 0}</span>
                                <span>Reports: {item.reportCount || 0}</span>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex flex-wrap gap-1">
                                {item.isPinned && <span className="badge bg-primary">Pinned</span>}
                                {item.isSpam && <span className="badge bg-danger">Spam Flag</span>}
                                {item.replyLevel > 0 && <span className="badge bg-secondary">Reply Lvl {item.replyLevel}</span>}
                              </div>
                            </td>
                            <td className="text-muted small" style={{ fontSize: '11px' }}>
                              {new Date(item.createdAt).toLocaleDateString()}
                            </td>
                            <td className="text-end">
                              <div className="d-flex gap-2 justify-content-end">
                                {item.isDeleted ? (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success rounded-3"
                                    onClick={() => handleRestore(item._id)}
                                    title="Restore Comment"
                                  >
                                    <i className="bi bi-arrow-counterclockwise"></i>
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      className={`btn btn-sm ${item.isPinned ? 'btn-primary' : 'btn-outline-primary'} rounded-3`}
                                      onClick={() => handlePin(item._id)}
                                      title={item.isPinned ? 'Unpin comment' : 'Pin comment'}
                                    >
                                      <i className="bi bi-pin-angle"></i>
                                    </button>
                                    {item.status !== 'Approved' && (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-success rounded-3"
                                        onClick={() => handleModerate(item._id, 'Approved')}
                                        title="Approve Comment"
                                      >
                                        <i className="bi bi-check-lg"></i>
                                      </button>
                                    )}
                                    {item.status !== 'Rejected' && (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-warning rounded-3"
                                        onClick={() => handleModerate(item._id, 'Rejected')}
                                        title="Reject Comment"
                                      >
                                        <i className="bi bi-slash-circle"></i>
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-secondary rounded-3"
                                      onClick={() => handleSoftDelete(item._id)}
                                      title="Soft Delete"
                                    >
                                      <i className="bi bi-trash3"></i>
                                    </button>
                                  </>
                                )}
                                {user?.role === 'Admin' && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger rounded-3 text-white"
                                    onClick={() => handleHardDelete(item._id)}
                                    title="Hard Delete permanently"
                                  >
                                    <i className="bi bi-trash-fill"></i>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination footer */}
                  {pages > 1 && (
                    <nav className="d-flex justify-content-between align-items-center mt-4">
                      <span className="text-secondary small">Page {page} of {pages}</span>
                      <ul className="pagination pagination-sm pagination-rounded gap-1 mb-0">
                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link rounded-3 px-3 py-1-5 border-0 shadow-sm"
                            onClick={() => setPage(page - 1)}
                          >
                            Prev
                          </button>
                        </li>
                        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                          <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                            <button
                              className="page-link rounded-3 px-3 py-1-5 border-0 shadow-sm"
                              onClick={() => setPage(p)}
                            >
                              {p}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${page === pages ? 'disabled' : ''}`}>
                          <button
                            className="page-link rounded-3 px-3 py-1-5 border-0 shadow-sm"
                            onClick={() => setPage(page + 1)}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-chat-left-x fs-1 text-muted d-block mb-3"></i>
                  <p className="text-muted mb-0">No comments match the search parameters or filter criteria.</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default CommentModerator;
