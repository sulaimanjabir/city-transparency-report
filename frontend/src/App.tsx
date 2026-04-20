import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import DeptAdminDashboard from './pages/dept-admin/DeptAdminDashboard';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/feed"
          element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/department"
          element={
            <ProtectedRoute allowedRoles={['dept_admin']}>
              <DeptAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
