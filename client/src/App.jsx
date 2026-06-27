import React, { useContext, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

// Pages - Lazily Loaded
const Home = lazy(() => import('./pages/Home'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const AuthorProfile = lazy(() => import('./pages/AuthorProfile'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));

// Admin / Creator Pages - Lazily Loaded
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const BlogManager = lazy(() => import('./pages/admin/BlogManager'));
const BlogForm = lazy(() => import('./pages/admin/BlogForm'));
const CategoryManager = lazy(() => import('./pages/admin/CategoryManager'));
const UserManager = lazy(() => import('./pages/admin/UserManager'));
const CommentModerator = lazy(() => import('./pages/admin/CommentModerator'));
const ContactInquiries = lazy(() => import('./pages/admin/ContactInquiries'));
const MediaLibrary = lazy(() => import('./pages/admin/MediaLibrary'));

const AppContent = () => {
  const { toastMessage } = useContext(AuthContext);

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        
        {/* Toast Notification Renderer */}
        {toastMessage && (
          <div className="toast-container-custom">
            <div className={`toast-custom bg-${toastMessage.type} border-0 text-white`}>
              <div className="d-flex w-100 justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${toastMessage.type === 'success' ? 'bi-check-circle-fill' : toastMessage.type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'}`}></i>
                  <span>{toastMessage.message}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <Navbar />

        <main className="flex-grow-1">
          <Suspense fallback={
            <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '50vh' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading page...</span>
              </div>
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/blogs" element={<BlogList />} />
              <Route path="/blogs/:slug" element={<BlogDetail />} />
              <Route path="/author/:id" element={<AuthorProfile />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Authenticated Protected Routes */}
              <Route element={<PrivateRoute allowedRoles={['Visitor', 'Author', 'Editor', 'Admin']} />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/settings" element={<ProfileSettings />} />
              </Route>

              {/* Creators & Authors Protected Routes */}
              <Route element={<PrivateRoute allowedRoles={['Author', 'Editor', 'Admin']} />}>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/blogs" element={<BlogManager />} />
                <Route path="/admin/blogs/new" element={<BlogForm />} />
                <Route path="/admin/blogs/edit/:id" element={<BlogForm />} />
                <Route path="/admin/media" element={<MediaLibrary />} />
              </Route>

              {/* System Admins Protected Routes */}
              <Route element={<PrivateRoute allowedRoles={['Admin']} />}>
                <Route path="/admin/categories" element={<CategoryManager />} />
                <Route path="/admin/comments" element={<CommentModerator />} />
                <Route path="/admin/users" element={<UserManager />} />
                <Route path="/admin/contacts" element={<ContactInquiries />} />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
