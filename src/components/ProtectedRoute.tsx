import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-lg text-gray-600'>로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  return <>{children}</>;
};
