import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import PublicRoute from './PublicRoute';
import { RouteConfig } from '@/config/routes';

interface RouteWrapperProps {
  route: RouteConfig;
}

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-waselify-500 mx-auto mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const RouteWrapper: React.FC<RouteWrapperProps> = ({ route }) => {
  const { path, component: Component, protected: isProtected, admin: isAdmin, public: isPublic } = route;

  // Wrap component with appropriate route protection
  const WrappedComponent = () => {
    if (isProtected) {
      return (
        <ProtectedRoute>
          <Component />
        </ProtectedRoute>
      );
    }

    if (isAdmin) {
      return (
        <AdminRoute>
          <Component />
        </AdminRoute>
      );
    }

    if (isPublic) {
      return (
        <PublicRoute>
          <Component />
        </PublicRoute>
      );
    }

    return <Component />;
  };

  return (
    <Route
      path={path}
      element={
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <WrappedComponent />
          </Suspense>
        </ErrorBoundary>
      }
    />
  );
};

export default RouteWrapper;




