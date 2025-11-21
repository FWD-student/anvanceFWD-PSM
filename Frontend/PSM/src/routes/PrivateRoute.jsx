import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};

const isAdmin = () => {
  // Leer el rol desde localStorage (guardado durante el login)
  const role = localStorage.getItem('userRole') || '';
  return role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrador';
};

export const PrivateRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/sesion" replace />;
  }
  return children;
};

export const AdminRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/sesion" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PrivateRoute;