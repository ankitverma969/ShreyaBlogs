import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingScreen from './LoadingScreen.jsx';
import { useAuth } from '../hooks/useAuth.js';

function ProtectedRoute() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return <LoadingScreen message="Checking admin session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/v1/adminShreyaTiwari/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
