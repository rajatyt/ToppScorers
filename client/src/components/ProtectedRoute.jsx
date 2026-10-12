import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-primary font-medium">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700/80 rounded-3xl p-8 shadow-2xl text-center animate-fadeInUp">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-2xl font-bold shadow-lg shadow-amber-500/10">
            🔒
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Access Restricted</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            This area requires <span className="text-amber-400 font-bold uppercase">{allowedRoles.join(' / ')}</span> access. You are currently signed in as <strong className="text-white">{user.name || user.email}</strong> (<span className="capitalize text-amber-400 font-bold">{user.role}</span>).
          </p>
          <div className="space-y-3">
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
