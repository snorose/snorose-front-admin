import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppSidebar, ProtectedRoute } from '@/shared/components';
import { Sidebar, Toaster } from '@/shared/components/ui';
import { AuthProvider } from '@/shared/contexts';
import { PATHS } from '@/shared/constants/paths';

import {
  AdjustAllMemberPointPage,
  AdjustSinglePointPage,
  CommentPage,
  ExamReviewPage,
  LogInPage,
  MemberInfoPage,
  MemberPenaltyManagementPage,
  PointFreezePage,
  PostPage,
  PushNotificationPage,
} from '@/pages';

import './App.css';

// QueryClient 인스턴스 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5분
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster richColors position='top-right' />
          <Routes>
            <Route path='/' element={<LogInPage />} />
            <Route
              path='/*'
              element={
                <ProtectedRoute>
                  <div className='flex min-h-screen'>
                    <Sidebar.Provider>
                      <AppSidebar />
                      <main className='flex flex-1 flex-col overflow-hidden px-6 py-5'>
                        <section className='flex w-full flex-1 overflow-auto'>
                          <Routes>
                            <Route
                              path={PATHS.MEMBER_INFO}
                              element={<MemberInfoPage />}
                            />
                            <Route
                              path={PATHS.MEMBER_PENALTY}
                              element={<MemberPenaltyManagementPage />}
                            />
                            <Route
                              path={PATHS.REVIEW_EXAM}
                              element={<ExamReviewPage />}
                            />
                            <Route
                              path={PATHS.POINT_SINGLE}
                              element={<AdjustSinglePointPage />}
                            />
                            <Route
                              path={PATHS.POINT_ALL}
                              element={<AdjustAllMemberPointPage />}
                            />
                            <Route
                              path={PATHS.POINT_HISTORY}
                              element={<PointFreezePage />}
                            />
                            <Route path={PATHS.POSTS} element={<PostPage />} />
                            <Route
                              path={PATHS.POST_COMMENTS}
                              element={<CommentPage />}
                            />
                            <Route
                              path={PATHS.ALERTS}
                              element={<PushNotificationPage />}
                            />
                          </Routes>
                        </section>
                      </main>
                    </Sidebar.Provider>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
