import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import {
  ExamReviewPage,
  MemberInfoPage,
  MemberPenaltyManagementPage,
  AdjustSinglePointPage,
  PointAllPage,
  PointFreezePage,
  LogInPage,
  PostPage,
  CommentPage,
  PushNotificationPage,
} from './pages';
import { AppSidebar, ProtectedRoute } from '@/components';
import { SidebarProvider, Toaster } from '@/components/ui';
import { AuthProvider } from '@/contexts';

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
                    <SidebarProvider>
                      <AppSidebar />
                      <main className='flex flex-1 flex-col overflow-hidden px-6 py-5'>
                        <section className='flex w-full flex-1 overflow-auto'>
                          <Routes>
                            <Route
                              path='/member/info'
                              element={<MemberInfoPage />}
                            />
                            <Route
                              path='/member/managePenalty'
                              element={<MemberPenaltyManagementPage />}
                            />
                            <Route
                              path='/exam/list'
                              element={<ExamReviewPage />}
                            />
                            <Route
                              path='/points/single'
                              element={<AdjustSinglePointPage />}
                            />
                            <Route
                              path='/points/all'
                              element={<PointAllPage />}
                            />
                            <Route
                              path='/points/freeze'
                              element={<PointFreezePage />}
                            />
                            <Route path='/post' element={<PostPage />} />
                            <Route path='/comment' element={<CommentPage />} />
                            <Route
                              path='/alerts'
                              element={<PushNotificationPage />}
                            />
                          </Routes>
                        </section>
                      </main>
                    </SidebarProvider>
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
