import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDashboard from './AdminDashboard';
import WidgetManager from './WidgetManager';
import ProfileManager from './ProfileManager';
import UserManager from './UserManager';
import FAQEditor from './FAQEditor';
import ModerationManager from './ModerationManager';
import VerificationQueue from './VerificationQueue';

const AdminRoutes = () => (
  <AdminLayout>
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="verifications" element={<VerificationQueue />} />
      <Route path="widgets" element={<WidgetManager />} />
      <Route path="profiles" element={<ProfileManager />} />
      <Route path="users" element={<UserManager />} />
      <Route path="faqs" element={<FAQEditor />} />
      <Route path="moderation" element={<ModerationManager />} />
    </Routes>
  </AdminLayout>
);

export default AdminRoutes;
