import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { RootState } from '../store/store';

const ProtectedRoute = () => {
  const { isAuthenticated, isSessionLoading, isInitialized } = useSelector((state: RootState) => state.auth);

  // Mostrar loading mientras se inicializa la sesión
  if (!isInitialized || isSessionLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Si no está autenticado, redirigir a la página de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizar el componente hijo (la página protegida)
  return <Outlet />;
};

export default ProtectedRoute;
