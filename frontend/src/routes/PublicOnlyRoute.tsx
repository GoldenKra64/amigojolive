import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

export default function PublicOnlyRoute() {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner label="Cargando..." />
      </div>
    );
  }

  if (token && user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
