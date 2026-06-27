import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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

  const featuredBlog = blogs.length > 0 ? blogs[0] : null;
  const featuredArticles = blogs.length > 1 ? blogs.slice(1) : [];
  const hasActiveFilters = categoryParam || searchParam || tagParam || authorParam || startDateParam || endDateParam || sortByParam !== 'latest';

  return (
    <div className="container py-5">
      <section className="blog-list-hero rounded-4 border border-1 border-light shadow-sm p-5 mb-5 bg-white">
        <div className="row align-items-center gy-4">
          <div className="col-lg-7">
            <span className="eyebrow-label text-primary fw-semibold mb-3 d-inline-block">Explore SmartBlog</span>
            <h1 className="display-5 fw-bold mb-3">Discover Stories That Inspire</h1>
            <p className="lead text-muted">Explore insightful articles on technology, business, lifestyle and modern innovation.</p>
          </div>
          <div className="col-lg-5">
            <form className="hero-search-card p-4 rounded-4 bg-light border" onSubmit={handleApplyFilters}>
              <div className="mb-3">
                <label className="form-label fw-medium text-secondary small">Search articles</label>
                <div className="input-group shadow-sm rounded-4 overflow-hidden bg-white border">
                  <span className="input-group-text bg-white border-0 text-secondary"><i className="bi bi-search"></i></span>
                  <input
                    type="text"
                    className="form-control border-0"
                    placeholder="Search stories, authors, or topics"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    aria-label="Search articles"
                  />
                </div>
              </div>
              <div className="row g-3 align-items-end">
                <div className="col-sm-6">
                  <label className="form-label fw-medium text-secondary small">Category</label>
                  <select className="form-select rounded-4" value={categoryParam} onChange={(e) => handleCategorySelect(e.target.value)}>
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-sm-6">
                  <label className="form-label fw-medium text-secondary small">Sort by</label>
                  <select className="form-select rounded-4" value={sortByParam} onChange={(e) => updateParams({ sortBy: e.target.value })}>
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="mostViewed">Most Viewed</option>
                    <option value="mostCommented">Most Commented</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>
                <div className="col-12 d-grid">
                  <button type="submit" className="btn btn-premium-primary rounded-4 py-2 fw-semibold">Search stories</button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="popular-categories mt-4 pt-3 border-top">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <span className="fw-semibold">Popular categories</span>
              {hasActiveFilters && (
                <button type="button" className="btn btn-link text-secondary text-decoration-none" onClick={handleClearFilters}>Clear filters</button>
              )}
            </div>
            <div className="mt-3 d-flex flex-wrap gap-2">
              <button
                type="button"
                className={`category-pill ${!categoryParam ? 'active' : ''}`}
                onClick={() => handleCategorySelect('')}
              >
                All
              </button>
              {categories.slice(0, 8).map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  className={`category-pill ${categoryParam === cat.slug ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="row gx-5">
        <main className="col-xl-8">
          {loading ? (
            <div className="row g-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="col-md-6">
                  <div className="skeleton-card rounded-4"></div>
                </div>
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <>
              {featuredBlog && (
                <section className="featured-article-card mb-5 rounded-4 overflow-hidden shadow-sm border bg-white">
                  <div className="row g-0 align-items-stretch">
                    <div className="col-lg-6 position-relative featured-image-panel overflow-hidden">
                      {featuredBlog.featuredImage ? (
                        <img src={featuredBlog.featuredImage} alt={featuredBlog.title} className="w-100 h-100 object-cover" loading="lazy" />
                      ) : (
                        <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white">
                          <i className="bi bi-image fs-1"></i>
                        </div>
                      )}
                      <span className="category-pill position-absolute top-0 start-0 m-4">{featuredBlog.category?.name || 'Featured'}</span>
                    </div>
                    <div className="col-lg-6 p-5 d-flex flex-column justify-content-between">
                      <div>
                        <span className="eyebrow-label text-primary fw-semibold mb-3 d-inline-block">Featured Story</span>
                        <h2 className="fw-bold mb-3">{featuredBlog.title}</h2>
                        <p className="text-muted mb-4">{featuredBlog.excerpt || featuredBlog.content?.replace(/<[^>]+>/g, '').slice(0, 160) + '...'}</p>
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-3 mb-4">
                          {featuredBlog.author?.profileImage ? (
                            <img src={featuredBlog.author.profileImage} alt={featuredBlog.author.name} className="rounded-circle" style={{ width: '48px', height: '48px', objectFit: 'cover' }} loading="lazy" />
                          ) : (
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                              {featuredBlog.author?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                          )}
                          <div>
                            <p className="mb-1 fw-semibold">{featuredBlog.author?.name || 'Author'}</p>
                            <p className="text-muted small mb-0">{featuredBlog.readingTime || 1} min read • {new Date(featuredBlog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <Link to={`/blogs/${featuredBlog.slug}`} className="btn btn-premium-primary rounded-pill px-4 py-2">Read more</Link>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <div className="row g-4">
                {featuredArticles.map((blog) => (
                  <div key={blog._id} className="col-md-6">
                    <BlogCard blog={blog} />
                  </div>
                ))}
              </div>

              {pagination.pages > 1 && (
                <nav className="d-flex justify-content-center mt-5">
                  <ul className="pagination pagination-modern gap-2">
                    <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handlePageSelect(pagination.page - 1)}><i className="bi bi-chevron-left"></i></button>
                    </li>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <li key={p} className={`page-item ${pagination.page === p ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageSelect(p)}>{p}</button>
                      </li>
                    ))}
                    <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handlePageSelect(pagination.page + 1)}><i className="bi bi-chevron-right"></i></button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          ) : (
            <div className="empty-state-card rounded-4 shadow-sm p-5 text-center bg-white">
              <div className="mb-4">
                <i className="bi bi-file-earmark-excel-fill fs-1 text-primary"></i>
              </div>
              <h3 className="fw-bold mb-2">No Articles Found</h3>
              <p className="text-muted mb-4">Your search or filters didn’t match any stories. Try adjusting your search or clear all filters.</p>
              <button className="btn btn-outline-primary rounded-pill" onClick={handleClearFilters}>Clear filters</button>
            </div>
          )}
        </main>

        <aside className="col-xl-4">
          <div className="filter-panel rounded-4 bg-white border shadow-sm p-4 sticky-lg">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <p className="text-uppercase text-primary fs-xs fw-semibold mb-1">Refine search</p>
                <h5 className="fw-bold mb-0">Filters</h5>
              </div>
              {hasActiveFilters && (
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleClearFilters}>Reset</button>
              )}
            </div>
            <form onSubmit={handleApplyFilters}>
              <div className="mb-4">
                <label className="form-label fw-semibold text-secondary small">Keyword</label>
                <input type="text" className="form-control rounded-4" placeholder="Search stories" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold text-secondary small">Author</label>
                <select className="form-select rounded-4" value={authorParam} onChange={(e) => updateParams({ author: e.target.value })}>
                  <option value="">All authors</option>
                  {authors.map((author) => (
                    <option key={author._id} value={author._id}>{author.name}</option>
                  ))}
                </select>
              </div>
              <div className="row g-3 mb-4">
                <div className="col-sm-6">
                  <label className="form-label fw-semibold text-secondary small">Start date</label>
                  <input type="date" className="form-control rounded-4" value={startDateInput} onChange={(e) => setStartDateInput(e.target.value)} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label fw-semibold text-secondary small">End date</label>
                  <input type="date" className="form-control rounded-4" value={endDateInput} onChange={(e) => setEndDateInput(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="btn btn-premium-primary rounded-4 w-100 py-2">Apply filters</button>
            </form>
            <div className="mt-5">
              <p className="fw-semibold text-secondary mb-3">Popular tags</p>
              <div className="d-flex flex-wrap gap-2">
                {tagsList.map((t) => {
                  const isActive = tagParam === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`category-pill ${isActive ? 'active' : ''}`}
                      onClick={() => updateParams({ tag: isActive ? '' : t })}
                    >
                      #{t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogList;
