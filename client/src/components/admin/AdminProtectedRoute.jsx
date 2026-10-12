import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AdminAuthContext } from '../../context/AdminAuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { adminUser, adminLoading, isAdminAuthenticated } = useContext(AdminAuthContext);

  if (adminLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-amber-500 font-medium">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminProtectedRoute;
