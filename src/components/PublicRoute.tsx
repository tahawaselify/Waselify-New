import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { Loader2 } from 'lucide-react';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('PublicRoute: loading =', loading, 'user =', user, 'path =', location.pathname);
    
    // Allow authenticated users to access sample dashboard routes
    const isSampleDashboard = location.pathname.startsWith('/sample-');
    
    if (!loading && user && !isSampleDashboard) {
      console.log('PublicRoute: Redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate, location.pathname]);

  // Show loading spinner while checking auth
  if (loading) {
    console.log('PublicRoute: Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-waselify-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show children if not authenticated
  if (!user) {
    console.log('PublicRoute: Showing login page');
    return <>{children}</>;
  }

  // Allow authenticated users to access sample dashboard routes
  const isSampleDashboard = location.pathname.startsWith('/sample-');
  
  if (isSampleDashboard) {
    console.log('PublicRoute: User authenticated, showing sample dashboard');
    return <>{children}</>;
  }

  // Return loading while redirecting for other public routes
  console.log('PublicRoute: User authenticated, showing redirect loading');
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-waselify-500 mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default PublicRoute; 