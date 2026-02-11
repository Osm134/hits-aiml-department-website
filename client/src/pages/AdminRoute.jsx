// AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const role = localStorage.getItem("role"); // get role from localStorage

  // if user is not admin, redirect to login
  if (role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return children; // allow admin to access
};

export default AdminRoute;
