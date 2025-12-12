import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, ToastProvider, useAuth } from './contexts';
import { useToast } from './contexts';
import { Layout } from './components/layout';
import { Loading } from './components/ui';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Store = lazy(() => import('./pages/Store').then(m => ({ default: m.Store })));
const Compare = lazy(() => import('./pages/Compare').then(m => ({ default: m.Compare })));
const Portfolio = lazy(() => import('./pages/Portfolio').then(m => ({ default: m.Portfolio })));
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Alerts = lazy(() => import('./pages').then(m => ({ default: m.Alerts })));
const NotFound = lazy(() => import('./pages').then(m => ({ default: m.NotFound })));

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { showError } = useToast();

  if (isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }

  if (!isAuthenticated) {
    showError('Login required', 'Please use the Login button to sign in.');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Routes Component (needs to be inside AuthProvider)
const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loading fullScreen text="Loading..." />}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />
      <Route
        path="/register"
        element={
          <Layout>
            <Register />
          </Layout>
        }
      />

      {/* Dashboard - Public */}
      <Route
        path="/"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />

      {/* Compare - Public */}
      <Route
        path="/compare"
        element={
          <Layout>
            <Compare />
          </Layout>
        }
      />

      {/* Store - Public (auth required for adding to cart) */}
      <Route
        path="/store"
        element={
          <Layout>
            <Store />
          </Layout>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/portfolio"
        element={
          <ProtectedRoute>
            <Layout>
              <Portfolio />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Layout>
              <Cart />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/alerts"
        element={
          <ProtectedRoute>
            <Layout>
              <Alerts />
            </Layout>
          </ProtectedRoute>
        }
      />

        {/* 404 Not Found */}
        <Route
          path="*"
          element={
            <Layout>
              <NotFound />
            </Layout>
          }
        />
      </Routes>
    </Suspense>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
