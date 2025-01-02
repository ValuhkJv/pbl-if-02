import { Navigate, useLocation } from 'react-router-dom';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const role = parseInt(localStorage.getItem('role'), 10);

  if (!user || !role) {
    // Redirect to login if not authenticated
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to dashboard if role is not allowed
    const roleMapping = {
      1: '/dashboard/staf',
      2: '/dashboard/kepalaunit',
      3: '/dashboard/unit',
      4: '/dashboard/mahasiswa'
    };
    return <Navigate to={roleMapping[role] || '/'} replace />;
  }

  return children;
};