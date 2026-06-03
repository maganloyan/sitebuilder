import { Navigate, useLocation } from "react-router-dom";
import { useFrappeAuth } from "frappe-react-sdk";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const { currentUser, isLoading } = useFrappeAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (requireAuth && !currentUser) {
    // Redirect to starter page if user is not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && currentUser) {
    // Redirect to home if user is already authenticated
    return <Navigate to="/portal" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;