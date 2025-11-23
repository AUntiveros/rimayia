import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage, OnboardingPage, HomePage, CommunityPage, CareNetworkPage } from './pages';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Ruta de onboarding (solo para usuarios primera vez) */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireOnboarding>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Rutas protegidas con layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="comunidad" element={<CommunityPage />} />
            <Route path="red-cuidado" element={<CareNetworkPage />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
