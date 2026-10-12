import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import WhatsAppFAB from './components/WhatsAppFAB';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Auth from './pages/Auth';
import FindTeachers from './pages/FindTeachers';
import FindStudents from './pages/FindStudents';
import ProfileDetail from './pages/ProfileDetail';
import Connections from './pages/Connections';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import AdminRoutes from './pages/admin/AdminRoutes';
import AdminLogin from './pages/admin/AdminLogin';
import TeacherVerification from './pages/TeacherVerification';
import TeacherProfileEdit from './pages/TeacherProfileEdit';
import TeacherVerificationPromptModal from './components/TeacherVerificationPromptModal';

import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import { AdminAuthProvider } from './context/AdminAuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <TeacherVerificationPromptModal />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Unified Auth (Login + Student Signup + Teacher Signup + Google Sign-In) */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />

          {/* Role-based Directories */}
          <Route path="/teachers" element={<FindTeachers />} />
          <Route path="/teachers/:id" element={<ProfileDetail />} />
          <Route path="/students" element={<FindStudents />} />
          <Route path="/students/:id" element={<ProfileDetail />} />

          {/* Authenticated Pages */}
          <Route path="/connections" element={
            <ProtectedRoute>
              <Connections />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherProfileEdit />
            </ProtectedRoute>
          } />

          <Route path="/verification" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherVerification />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          {/* Legal Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Dedicated Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Access (Restricted to Super Admin with isolated AdminAuthContext) */}
          <Route path="/admin/*" element={
            <AdminProtectedRoute>
              <AdminRoutes />
            </AdminProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdminRoute && <WhatsAppFAB />}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AdminAuthProvider>
            <Router>
              <AppContent />
            </Router>
          </AdminAuthProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
