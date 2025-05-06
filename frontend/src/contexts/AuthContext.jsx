import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [user, setUser] = useState(null); // Store basic user info (id, username)
  const [isLoading, setIsLoading] = useState(false); // Auth specific loading

  useEffect(() => {
    // Attempt to verify token on initial load if one exists
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedUserId = localStorage.getItem('userId');
      const storedUsername = localStorage.getItem('username');

      if (storedToken && storedUserId) {
         setToken(storedToken);
         setUser({ id: storedUserId, username: storedUsername });
        // Optionally: add a backend endpoint like /auth/verify to check token validity
        // For now, we assume the stored token is valid until an API call fails
      }
    };
    verifyToken();
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const { access_token, userId, username: loggedInUsername } = response.data;
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', loggedInUsername);
      setToken(access_token);
      setUser({ id: userId, username: loggedInUsername });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      setIsLoading(false);
      // Handle error display in the UI
      return false;
    }
  };

  const signup = async (username, email, password) => {
     setIsLoading(true);
    try {
      await apiClient.post('/auth/signup', { username, email, password });
      setIsLoading(false);
      return true; // Indicate success, user should now login
    } catch (error) {
      console.error('Signup failed:', error.response?.data || error.message);
       setIsLoading(false);
      // Handle error display (e.g., username exists)
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};