import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import {
  ExamReviewPage,
  MemberInfoPage,
  MemberPenaltyManagementPage,
  AdjustSinglePointPage,
  AdjustAllMemberPointPage,
  PointFreezePage,
  LogInPage,
  PostPage,
  CommentPage,
  PushNotificationPage,
} from './pages';
import { AppSidebar, ProtectedRoute } from '@/components';
import { SidebarProvider, Toaster } from '@/components/ui';
import { AuthProvider } from '@/contexts';

function App() {
  return (
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
                            element={<AdjustAllMemberPointPage />}
                          />
                          <Route
                            path='/points/freeze'
                            element={<PointFreezePage />}
                          />
                          <Route path='/post' element={<PostPage />} />
                          <Route path='/comment' element={<CommentPage />} />
                          <Route
                            path='/operation/push'
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
  );
}

export default App;
