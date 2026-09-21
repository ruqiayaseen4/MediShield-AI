import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { MedicineVerification } from '@/pages/MedicineVerification';
import { MedicineScanner } from '@/pages/MedicineScanner';
import { DrugInteraction } from '@/pages/DrugInteraction';
import { AddictionRisk } from '@/pages/AddictionRisk';
import { MedicineSearch } from '@/pages/MedicineSearch';
import { AIDoctorConsultation } from '@/pages/AIDoctorConsultation';
import { About } from '@/pages/About';
import { useEffect } from 'react';

function App() {
  const { isAuthenticated, token, fetchUser } = useAuthStore();

  useEffect(() => {
    if (token && !isAuthenticated) {
      fetchUser();
    }
  }, [token, isAuthenticated, fetchUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/about" element={<About />} />

        {/* Protected routes with layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verify" element={<MedicineVerification />} />
          <Route path="/scanner" element={<MedicineScanner />} />
          <Route path="/interactions" element={<DrugInteraction />} />
          <Route path="/addiction-risk" element={<AddictionRisk />} />
          <Route path="/search" element={<MedicineSearch />} />
          <Route path="/ai-doctor" element={<AIDoctorConsultation />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
