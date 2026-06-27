import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';
import getImageUrl from '../../utils/getImageUrl';

const MediaLibrary = () => {
  const { token, showToast, user } = useContext(AuthContext);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Toolbar & paging states
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Selection states
  const [selectedIds, setSelectedIds] = useState([]);

  // Uploading state
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Modals state
  const [previewItem, setPreviewItem] = useState(null);
  const [renameItem, setRenameItem] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/media?page=${page}&limit=12&search=${encodeURIComponent(search)}&sortBy=${sortBy}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setMediaList(res.data.data);
        setPages(res.data.pagination.pages);
        setTotal(res.data.pagination.total);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load media assets.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMedia();
    }
  }, [token, page, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMedia();
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File is too large. Maximum upload size is 5MB.', 'danger');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/media', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        if (res.data.isDuplicate) {
          showToast('Duplicate file detected! Returned existing resource.', 'info');
        } else {
          showToast('File uploaded successfully!', 'success');
          // Reload page 1
          setPage(1);
          fetchMedia();
        }
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Upload failed.', 'danger');
    } finally {
      setUploading(false);
      e.target.value = null; // reset input
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media file? This will remove it from the server.')) return;

    try {
      const res = await api.delete(`/media/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showToast('Media file removed successfully.', 'success');
        setMediaList(mediaList.filter((m) => m._id !== id));
        setSelectedIds(selectedIds.filter((selId) => selId !== id));
        setTotal(total - 1);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete media file.', 'danger');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete all ${selectedIds.length} selected files?`)) return;

    try {
      const res = await api.post(
        '/media/bulk-delete',
        { ids: selectedIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showToast('Selected files deleted successfully.', 'success');
        setMediaList(mediaList.filter((m) => !selectedIds.includes(m._id)));
        setSelectedIds([]);
        fetchMedia();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to bulk delete files.', 'danger');
    }
  };

  const handleOpenRename = (item) => {
    setRenameItem(item);
    // Remove extension for easier editing
    const dotIndex = item.filename.lastIndexOf('.');
    const nameOnly = dotIndex > -1 ? item.filename.substring(0, dotIndex) : item.filename;
    setRenameValue(nameOnly);
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renameValue.trim()) return;

    try {
      const res = await api.put(
        `/media/${renameItem._id}/rename`,
        { newName: renameValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showToast('File renamed successfully.', 'success');
        setMediaList(mediaList.map((m) => (m._id === renameItem._id ? res.data.data : m)));
        setRenameItem(null);
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to rename file.', 'danger');
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selId) => selId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === mediaList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(mediaList.map((m) => m._id));
    }
  };

  const copyToClipboard = (filename) => {
    const fullUrl = getImageUrl(filename);
    navigator.clipboard.writeText(fullUrl)
      .then(() => showToast('Image URL copied to clipboard!', 'success'))
      .catch(() => showToast('Failed to copy URL.', 'danger'));
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
              <Link to="/admin/comments" className="nav-link">
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
            <li className="nav-item mt-3">
              <span className="text-secondary small px-3 text-uppercase fw-bold">Assets</span>
            </li>
            <li>
              <Link to="/admin/media" className="nav-link active">
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

        {/* Media Library Panel */}
        <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom">
            <h1 className="h2 fw-bold">Media Library</h1>
            <div className="d-flex gap-2">
              <input
                type="file"
                className="d-none"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
              />
              <button
                className="btn btn-primary rounded-3 d-flex align-items-center gap-1"
                onClick={handleUploadClick}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-upload"></i>
                    <span>Upload Image</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filtering Toolbar */}
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between gap-3 align-items-sm-center">
              
              {/* Left search */}
              <form onSubmit={handleSearchSubmit} className="flex-grow-1" style={{ maxWidth: '400px' }}>
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="Search file name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="btn btn-primary" type="submit">
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </form>

              {/* Toolbar Actions */}
              <div className="d-flex align-items-center gap-3 justify-content-between justify-content-sm-end w-100 flex-wrap">
                
                <div className="d-flex align-items-center gap-2">
                  <label className="fw-semibold small mb-0">Sort:</label>
                  <select
                    className="form-select form-select-sm rounded-3"
                    style={{ width: '130px' }}
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="sizeDesc">Size (Large)</option>
                    <option value="sizeAsc">Size (Small)</option>
                  </select>
                </div>

                {/* View togglers */}
                <div className="btn-group btn-group-sm rounded-3 shadow-sm" role="group">
                  <button
                    type="button"
                    className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <i className="bi bi-grid-fill"></i>
                  </button>
                  <button
                    type="button"
                    className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <i className="bi bi-list-task"></i>
                  </button>
                </div>

                {/* Bulk controls */}
                <div className="d-flex gap-2">
                  {mediaList.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-3"
                      onClick={handleSelectAll}
                    >
                      {selectedIds.length === mediaList.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                  {selectedIds.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger rounded-3 text-white"
                      onClick={handleBulkDelete}
                    >
                      Delete ({selectedIds.length})
                    </button>
                  )}
                </div>

              </div>

            </div>
          </div>

          {/* Media Items */}
          {loading ? (
            <div className="row g-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="col-6 col-md-4 col-lg-3">
                  <div className="skeleton animate-pulse rounded-4" style={{ height: '180px' }}></div>
                </div>
              ))}
            </div>
          ) : mediaList.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className="row g-3">
                  {mediaList.map((item) => {
                    const isSelected = selectedIds.includes(item._id);
                    return (
                      <div key={item._id} className="col-6 col-md-4 col-lg-3">
                        <div className={`card border-0 shadow-sm rounded-4 h-100 overflow-hidden position-relative media-card ${isSelected ? 'border-primary border-2' : ''}`}>
                          
                          {/* Checkbox Overlay */}
                          <div className="position-absolute top-0 start-0 m-2" style={{ zIndex: 10 }}>
                            <input
                              type="checkbox"
                              className="form-check-input border-secondary shadow-sm"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(item._id)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                          </div>

                          {/* Image preview box */}
                          <div
                            className="bg-light d-flex align-items-center justify-content-center cursor-pointer overflow-hidden"
                            style={{ height: '140px' }}
                            onClick={() => setPreviewItem(item)}
                          >
                            <img
                              src={getImageUrl(item.filename)}
                              alt={item.originalName}
                              className="img-fluid w-100 h-100 object-fit-cover transition-transform"
                            />
                          </div>

                          {/* Info footer */}
                          <div className="p-3 bg-white border-top">
                            <h6 className="text-truncate fw-bold mb-1 text-dark" title={item.originalName}>
                              {item.originalName}
                            </h6>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-muted small" style={{ fontSize: '11px' }}>
                                {formatBytes(item.fileSize)}
                              </span>
                              
                              {/* Hover actions */}
                              <div className="d-flex gap-1">
                                <button
                                  type="button"
                                  className="btn btn-link p-0 text-secondary"
                                  onClick={() => copyToClipboard(item.filename)}
                                  title="Copy URL"
                                >
                                  <i className="bi bi-link-45deg fs-5"></i>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-link p-0 text-secondary"
                                  onClick={() => handleOpenRename(item)}
                                  title="Rename File"
                                >
                                  <i className="bi bi-pencil fs-6"></i>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-link p-0 text-danger"
                                  onClick={() => handleDelete(item._id)}
                                  title="Delete File"
                                >
                                  <i className="bi bi-trash fs-6"></i>
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <div className="table-responsive">
                    <table className="table align-middle table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '40px' }}></th>
                          <th style={{ width: '80px' }}>Thumbnail</th>
                          <th>Filename</th>
                          <th>Original Name</th>
                          <th>File Size</th>
                          <th>Dimensions</th>
                          <th>Uploaded By</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mediaList.map((item) => {
                          const isSelected = selectedIds.includes(item._id);
                          return (
                            <tr key={item._id} className={isSelected ? 'table-primary bg-opacity-10' : ''}>
                              <td>
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelect(item._id)}
                                />
                              </td>
                              <td>
                                <div
                                  className="bg-light rounded overflow-hidden cursor-pointer"
                                  style={{ width: '50px', height: '40px' }}
                                  onClick={() => setPreviewItem(item)}
                                >
                                  <img
                                    src={getImageUrl(item.filename)}
                                    alt={item.originalName}
                                    className="w-100 h-100 object-fit-cover"
                                  />
                                </div>
                              </td>
                              <td className="text-truncate fw-bold text-dark" style={{ maxWidth: '150px' }}>{item.filename}</td>
                              <td className="text-truncate text-secondary" style={{ maxWidth: '150px' }}>{item.originalName}</td>
                              <td>{formatBytes(item.fileSize)}</td>
                              <td className="text-secondary small">
                                {item.dimensions?.width && item.dimensions?.height
                                  ? `${item.dimensions.width} x ${item.dimensions.height}`
                                  : 'N/A'}
                              </td>
                              <td className="small">{item.uploadedBy?.name || 'Deleted Creator'}</td>
                              <td className="text-end">
                                <div className="d-flex gap-2 justify-content-end">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => copyToClipboard(item.filename)}
                                    title="Copy URL"
                                  >
                                    <i className="bi bi-link-45deg"></i>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => handleOpenRename(item)}
                                    title="Rename File"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(item._id)}
                                    title="Delete File"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pagination controls */}
              {pages > 1 && (
                <nav className="d-flex justify-content-between align-items-center mt-4">
                  <span className="text-secondary small">Page {page} of {pages}</span>
                  <ul className="pagination pagination-sm gap-1 mb-0">
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
            <div className="card border-0 shadow-sm p-5 rounded-4 text-center bg-white">
              <i className="bi bi-images fs-1 text-muted d-block mb-3"></i>
              <h4>No media assets found</h4>
              <p className="text-muted mb-4">You haven't uploaded any media items yet. Select an image file to start uploading!</p>
              <button
                type="button"
                className="btn btn-primary px-4 rounded-3"
                onClick={handleUploadClick}
              >
                Upload Your First Image
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="modal show d-block fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-light">
                <h5 className="modal-title fw-bold text-dark">{previewItem.originalName}</h5>
                <button type="button" className="btn-close" onClick={() => setPreviewItem(null)}></button>
              </div>
              <div className="modal-body p-0 bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '300px', maxHeight: '500px', overflow: 'hidden' }}>
                <img
                  src={getImageUrl(previewItem.filename)}
                  alt={previewItem.originalName}
                  className="img-fluid object-fit-contain"
                  style={{ maxHeight: '480px' }}
                />
              </div>
              <div className="modal-footer border-light bg-white d-flex justify-content-between">
                <div className="text-start small text-secondary">
                  <span className="d-block"><strong>Filename:</strong> {previewItem.filename}</span>
                  <span className="d-block">
                    <strong>Resolution:</strong> {previewItem.dimensions?.width && previewItem.dimensions?.height ? `${previewItem.dimensions.width} x ${previewItem.dimensions.height} px` : 'N/A'}
                  </span>
                  <span className="d-block"><strong>Size:</strong> {formatBytes(previewItem.fileSize)} | <strong>Mime:</strong> {previewItem.mimeType}</span>
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-3 btn-sm px-3"
                    onClick={() => copyToClipboard(previewItem.filename)}
                  >
                    Copy URL
                  </button>
                  <a
                    href={getImageUrl(previewItem.filename)}
                    download={previewItem.originalName}
                    className="btn btn-primary rounded-3 btn-sm px-3"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Original
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rename Dialog Modal */}
      {renameItem && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <form onSubmit={handleRenameSubmit}>
                <div className="modal-header border-light">
                  <h5 className="modal-title fw-bold">Rename Asset</h5>
                  <button type="button" className="btn-close" onClick={() => setRenameItem(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">New Filename</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control rounded-3"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        required
                      />
                      <span className="input-group-text rounded-end-3 bg-light text-secondary">
                        {path.extname(renameItem.filename)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-3 btn-sm px-3"
                    onClick={() => setRenameItem(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-3 btn-sm px-4"
                  >
                    Rename
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Extremely lightweight file extension helper fallback
const path = {
  extname: (filename) => {
    if (!filename) return '';
    const dotIdx = filename.lastIndexOf('.');
    return dotIdx > -1 ? filename.substring(dotIdx) : '';
  }
};

export default MediaLibrary;
