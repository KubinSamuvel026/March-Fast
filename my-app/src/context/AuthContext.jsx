/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, getProfile } from '../api/authAPI';
import {
  setAccessToken,
  setRefreshToken,
  getAccessToken,
  logout as logoutService
} from '../services/tokenService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize user from token and fetch profile
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;

    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        if (!active) return;
        setUser({ isAuthenticated: true, ...data });
      } catch {
        // If token is invalid/expired, log out.
        if (!active) return;
        logout();
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();

    // Listen for unauthorized events to automatically logout
    const handleUnauthorized = () => logout();
    window.addEventListener('unauthorized', handleUnauthorized);

    return () => {
      active = false;
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials) => {
    try {
      const data = await loginUser(credentials);
      // Assuming response has access and refresh tokens
      if (data.access) setAccessToken(data.access);
      if (data.refresh) setRefreshToken(data.refresh);

      // Assume JWT token payload or response contains user detail
      setUser({ isAuthenticated: true, ...data.user });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.detail
        || error.response?.data?.non_field_errors?.[0]
        || 'Invalid credentials';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      const data = await registerUser(userData);
      // After successful registration, usually we don't get a token immediately
      // or if we do, we can log them in. Based on typical flow, returning success.
      return { success: true, data };
    } catch (error) {
      const errorData = error.response?.data || {};
      // Gather all field errors into a single string for simplicity or return raw object
      return { success: false, errors: errorData };
    }
  };

  const logout = () => {
    logoutService();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
