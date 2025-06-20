import { Navigate } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, isLoading } = useUserContext();

  if (isLoading) return <div>Loading...</div>;

  if (!currentUser) return <Navigate to="/login" replace />;

  return <>{children}</>;
};


export default ProtectedRoute;
