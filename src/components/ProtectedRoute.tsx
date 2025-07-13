import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    console.log('🔒 Protected route: User not authenticated, redirecting to login');
    // Redirect to login page with the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is logged in and trying to access login/signup pages
  if (!requireAuth && user && (location.pathname === '/login' || location.pathname === '/signup')) {
    console.log('🔓 Protected route: User already authenticated, redirecting to home');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
