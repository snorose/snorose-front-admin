import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import {
  ExamReviewPage,
  MemberInfoPage,
  PointAdjustmentPage,
  LogInPage,
  PostPage,
  CommentPage,
  PushNotificationPage,
} from './pages';
import { AppSidebar } from '@/components';
import { SidebarProvider } from '@/components/ui';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LogInPage />} />
        <Route
          path='/*'
          element={
            <div className='flex min-h-screen'>
              <SidebarProvider>
                <AppSidebar />
                <main className='flex flex-1 flex-col overflow-hidden px-6 pt-5 pb-20'>
                  <section className='flex w-full flex-1 overflow-auto'>
                    <Routes>
                      <Route path='/member/info' element={<MemberInfoPage />} />
                      <Route path='/exam/list' element={<ExamReviewPage />} />
                      <Route
                        path='/point/single'
                        element={<PointAdjustmentPage />}
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
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
