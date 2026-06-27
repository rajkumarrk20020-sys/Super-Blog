import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Set global authorization header
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const loadProfile = async (currentToken) => {
    try {
      setLoading(true);
      const res = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.error('Profile fetch failed:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadProfile(token);
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: userToken, ...userData } = res.data.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        showToast('Logged in successfully!', 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      showToast(msg, 'danger');
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        const { token: userToken, ...userData } = res.data.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        showToast('Registration successful!', 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      showToast(msg, 'danger');
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (formData) => {
    try {
      setLoading(true);
      const res = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setUser(res.data.data);
        showToast('Profile settings updated successfully!', 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile settings.';
      showToast(msg, 'danger');
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      const res = await api.put(
        '/auth/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showToast('Password changed successfully!', 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password.';
      showToast(msg, 'danger');
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    showToast('Logged out successfully.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        updateProfile,
        changePassword,
        logout,
        showToast,
        toastMessage,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
