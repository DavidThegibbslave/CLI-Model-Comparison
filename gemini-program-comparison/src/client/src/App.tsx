import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { StoreProvider } from '@/context/StoreContext';
import Layout from '@/components/layout/Layout';

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const PortfolioPage = lazy(() => import('@/pages/PortfolioPage'));
const StorePage = lazy(() => import('@/pages/StorePage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const ComparePage = lazy(() => import('@/pages/ComparePage'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    <div className="animate-pulse text-xl font-semibold">Loading...</div>
  </div>
);

const ProtectedRoute = () => {
  // Demo mode: all routes are public
  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes (login/register retained but optional) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/market" element={<div className="text-2xl font-bold p-8">Market Data (Use Dashboard)</div>} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/portfolio" element={<PortfolioPage />} />
                  <Route path="/store" element={<StorePage />} />
                  <Route path="/cart" element={<CartPage />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;
