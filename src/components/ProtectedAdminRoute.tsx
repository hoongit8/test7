
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedAdminRoute = () => {
  const isAuthenticated = localStorage.getItem('adminToken') !== null;

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute; 