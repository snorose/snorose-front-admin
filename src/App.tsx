import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import {
  ExamReviewPage,
  MemberInfoPage,
  PointAdjustmentPage,
  LogInPage,
  PostPage,
  CommentPage,
} from './pages';
import { Header, Sidebar } from './components';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LogInPage />} />
        <Route
          path='/*'
          element={
            <div className='flex min-h-screen flex-col'>
              <Header />
              <main className='flex flex-1 overflow-hidden pt-14'>
                <Sidebar />
                <section className='flex w-full flex-1 overflow-auto px-6 pt-4 pb-20'>
                  <Routes>
                    <Route path='/exam' element={<ExamReviewPage />} />
                    <Route path='/member' element={<MemberInfoPage />} />
                    <Route path='/point' element={<PointAdjustmentPage />} />
                    <Route path='/post' element={<PostPage />} />
                    <Route path='/comment' element={<CommentPage />} />
                  </Routes>
                </section>
              </main>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
