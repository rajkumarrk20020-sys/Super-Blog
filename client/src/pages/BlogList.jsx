import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import BlogCard from '../components/BlogCard';

const BlogList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Query states (synced with URL search params)
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const pageParam = searchParams.get('page') || '1';
  const tagParam = searchParams.get('tag') || '';
  const authorParam = searchParams.get('author') || '';
  const sortByParam = searchParams.get('sortBy') || 'latest';
  const startDateParam = searchParams.get('startDate') || '';
  const endDateParam = searchParams.get('endDate') || '';

  const [searchInput, setSearchInput] = useState(searchParam);
  const [startDateInput, setStartDateInput] = useState(startDateParam);
  const [endDateInput, setEndDateInput] = useState(endDateParam);

  const tagsList = ['AI', 'Coding', 'Technology', 'Minimalism', 'Productivity', 'Lifestyle', 'Future'];

  useEffect(() => {
    setSearchInput(searchParam);
    setStartDateInput(startDateParam);
    setEndDateInput(endDateParam);
  }, [searchParam, startDateParam, endDateParam]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuthors = async () => {
    try {
      const res = await axios.get('/api/auth/authors');
      if (res.data.success) {
        setAuthors(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/blogs?status=Published&category=${categoryParam}&search=${searchParam}&page=${pageParam}&tag=${tagParam}&authorId=${authorParam}&sortBy=${sortByParam}&startDate=${startDateParam}&endDate=${endDateParam}&limit=6`
      );
      if (res.data.success) {
        setBlogs(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAuthors();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [categoryParam, searchParam, pageParam, tagParam, authorParam, sortByParam, startDateParam, endDateParam]);

  const updateParams = (newParams) => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      if (value) params[key] = value;
    }
    
    Object.keys(newParams).forEach(key => {
      if (newParams[key] !== undefined) {
        if (newParams[key] === '') {
          delete params[key];
        } else {
          params[key] = newParams[key];
        }
      }
    });

    if (!newParams.page) {
      params.page = '1';
    }

    setSearchParams(params);
  };

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    updateParams({
      search: searchInput,
      startDate: startDateInput,
      endDate: endDateInput
    });
  };

  const handleCategorySelect = (slug) => {
    updateParams({ category: slug });
  };

  const handlePageSelect = (pageNumber) => {
    updateParams({ page: pageNumber.toString() });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setStartDateInput('');
    setEndDateInput('');
    setSearchParams({});
  };

  return (
    <div className="container py-5">
      <div className="row">
        
        {/* Sidebar / Filters Column */}
        <div className="col-lg-3 mb-4">
          
          {/* Clear Filters Button */}
          {(categoryParam || searchParam || tagParam || authorParam || startDateParam || endDateParam || sortByParam !== 'latest') && (
            <button
              type="button"
              className="btn btn-outline-danger w-100 rounded-3 py-2 fw-semibold mb-4"
              onClick={handleClearFilters}
            >
              Clear Filters <i className="bi bi-x-circle ms-1"></i>
            </button>
          )}

          {/* Search & Dates Card */}
          <div className="card border-0 shadow-sm p-4 rounded-4 mb-4">
            <h5 className="fw-bold mb-3">Search & Date</h5>
            <form onSubmit={handleApplyFilters}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small">Keyword</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Keyword..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small">Start Date</label>
                <input
                  type="date"
                  className="form-control text-secondary"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small">End Date</label>
                <input
                  type="date"
                  className="form-control text-secondary"
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                />
              </div>

              <button className="btn btn-primary btn-sm w-100 rounded-3 py-2 fw-semibold" type="submit">
                Apply Search & Date <i className="bi bi-funnel ms-1"></i>
              </button>
            </form>
          </div>

          {/* Categories Card */}
          <div className="card border-0 shadow-sm p-4 rounded-4 mb-4">
            <h5 className="fw-bold mb-3">Categories</h5>
            <div className="list-group list-group-flush">
              <button
                type="button"
                className={`list-group-item list-group-item-action border-0 px-0 d-flex justify-content-between align-items-center fw-medium ${!categoryParam ? 'text-primary' : 'text-secondary'}`}
                onClick={() => handleCategorySelect('')}
              >
                <span>All Categories</span>
                <i className="bi bi-chevron-right fs-12"></i>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  className={`list-group-item list-group-item-action border-0 px-0 d-flex justify-content-between align-items-center fw-medium ${categoryParam === cat.slug ? 'text-primary' : 'text-secondary'}`}
                  onClick={() => handleCategorySelect(cat.slug)}
                >
                  <span>{cat.name}</span>
                  <i className="bi bi-chevron-right fs-12"></i>
                </button>
              ))}
            </div>
          </div>

          {/* Author Card */}
          <div className="card border-0 shadow-sm p-4 rounded-4 mb-4">
            <h5 className="fw-bold mb-3">Author</h5>
            <select
              className="form-select rounded-3 text-secondary"
              value={authorParam}
              onChange={(e) => updateParams({ author: e.target.value })}
            >
              <option value="">All Authors</option>
              {authors.map((author) => (
                <option key={author._id} value={author._id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Card */}
          <div className="card border-0 shadow-sm p-4 rounded-4 mb-4">
            <h5 className="fw-bold mb-3">Popular Tags</h5>
            <div className="d-flex flex-wrap gap-2">
              {tagsList.map((t) => {
                const isActive = tagParam === t;
                return (
                  <button
                    key={t}
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-medium transition-all ${
                      isActive
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                    }`}
                    onClick={() => updateParams({ tag: isActive ? '' : t })}
                  >
                    #{t}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Blogs Listing Column */}
        <div className="col-lg-9">
          
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">
            <h2 className="fw-bold mb-0">
              {categoryParam ? `Category: ${categories.find(c => c.slug === categoryParam)?.name || categoryParam}` : 'All Articles'}
            </h2>
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted fw-medium whitespace-nowrap">{pagination.total} articles found</span>
              <select
                className="form-select form-select-sm rounded-3 shadow-sm border-0 bg-white"
                style={{ width: '160px', padding: '0.375rem 2.25rem 0.375rem 0.75rem' }}
                value={sortByParam}
                onChange={(e) => updateParams({ sortBy: e.target.value })}
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="mostViewed">Most Viewed</option>
                <option value="mostCommented">Most Commented</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="row g-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="col-md-6">
                  <div className="skeleton" style={{ width: '100%', height: '380px', borderRadius: '16px' }}></div>
                </div>
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <>
              <div className="row g-4">
                {blogs.map((blog) => (
                  <div key={blog._id} className="col-md-6">
                    <BlogCard blog={blog} />
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {pagination.pages > 1 && (
                <nav className="d-flex justify-content-center mt-5">
                  <ul className="pagination pagination-rounded gap-2">
                    <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link border-0 shadow-sm rounded-3 px-3 py-2"
                        onClick={() => handlePageSelect(pagination.page - 1)}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <li key={p} className={`page-item ${pagination.page === p ? 'active' : ''}`}>
                        <button
                          className="page-link border-0 shadow-sm rounded-3 px-3 py-2"
                          onClick={() => handlePageSelect(p)}
                        >
                          {p}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                      <button
                        className="page-link border-0 shadow-sm rounded-3 px-3 py-2"
                        onClick={() => handlePageSelect(pagination.page + 1)}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          ) : (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm mt-4">
              <i className="bi bi-journal-x fs-1 text-muted d-block mb-3"></i>
              <h4>No articles found</h4>
              <p className="text-muted mb-4">Try clearing filters or search parameter to find what you need.</p>
              <button className="btn btn-primary" onClick={handleClearFilters}>
                View All Articles
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default BlogList;
