import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-primary font-medium">Loading...</div>;
  }

  if (!isAuthenticated) {
    if (allowedRoles && allowedRoles.includes('admin')) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700/80 rounded-3xl p-8 shadow-2xl text-center animate-fadeInUp">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-2xl font-bold shadow-lg shadow-amber-500/10">
            🔒
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Admin Portal Restricted</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            You are currently signed in as <strong className="text-white">{user.name || user.email}</strong> (<span className="capitalize text-amber-400 font-bold">{user.role}</span>). This area is restricted to Super Administrators.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                window.location.href = '/admin/login';
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01]"
            >
              Sign In as Administrator
            </button>
            <a
              href="/"
              className="block w-full py-2.5 px-4 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-colors"
            >
              Return to Live Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
