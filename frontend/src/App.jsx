import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import AuthPage from './components/AuthPage';
import DashboardPage from './pages/DashboardPage';
import FarmsPage from './pages/FarmsPage';
import BuffaloesPage from './pages/BuffaloesPage';
import PregnancyPage from './pages/PregnancyPage';
import VaccinationsPage from './pages/VaccinationsPage';
import MedicalPage from './pages/MedicalPage';
import RemindersPage from './pages/RemindersPage';

export default function App() {
  return <Routes>
    <Route path="/login" element={<AuthPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="farms" element={<FarmsPage />} />
        <Route path="buffaloes" element={<BuffaloesPage />} />
        <Route path="pregnancy" element={<PregnancyPage />} />
        <Route path="vaccinations" element={<VaccinationsPage />} />
        <Route path="medical" element={<MedicalPage />} />
        <Route path="reminders" element={<RemindersPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
