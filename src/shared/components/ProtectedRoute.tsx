import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/shared/hooks';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-lg text-gray-600'>로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to='/'
        replace
        state={{
          returnTo: location.pathname + location.search + location.hash,
        }}
      />
    );
  }

  return <>{children}</>;
};
