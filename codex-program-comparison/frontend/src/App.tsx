import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { LayoutShell } from './components/layout/LayoutShell';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Spinner } from './components/ui/Spinner';

const DashboardPage = lazy(() => import('./pages/Dashboard'));
const ComparePage = lazy(() => import('./pages/Compare'));
const StorePage = lazy(() => import('./pages/Store'));
const CartPage = lazy(() => import('./pages/Cart'));
const LoginPage = lazy(() => import('./pages/Login'));
const RegisterPage = lazy(() => import('./pages/Register'));
const PortfolioPage = lazy(() => import('./pages/Portfolio'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <LayoutShell>
      <Suspense
        fallback={
          <div className="page-container" style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
            <Spinner /> <span>Loading…</span>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/store" element={<StorePage />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <PortfolioPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </LayoutShell>
  );
}

export default App;
