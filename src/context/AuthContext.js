import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (token && adminData) {
      setCurrentAdmin(JSON.parse(adminData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Attempting login with:", { email, password });
      
      const response = await authAPI.login(email, password);
      console.log("Login API response:", response.data);
      
      // Based on your API response structure
      if (response.data) {
        const userData = {
          token: response.data.token || response.data.userId,
          userId: response.data.userId || response.data._id,
          isAdmin: response.data.isAdmin === true,
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: email
        };
        
        // If admin privileges are required
        if (!userData.isAdmin) {
          throw new Error('You do not have admin privileges');
        }
        
        localStorage.setItem('adminToken', userData.token);
        localStorage.setItem('adminData', JSON.stringify(userData));
        setCurrentAdmin(userData);
        return userData;
      } else {
        throw new Error('Invalid login response');
      }
    } catch (err) {
      console.error("Login error details:", err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setCurrentAdmin(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentAdmin, 
        loading, 
        error,
        login,
        logout,
        isAuthenticated: !!currentAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
