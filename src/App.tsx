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
            <div className='flex flex-col w-screen h-screen overflow-hidden'>
              <Header />
              <main className='flex h-[calc(100vh-3.5rem)]'>
                <Sidebar />
                <Routes>
                  <Route path='/exam' element={<ExamReviewPage />} />
                  <Route path='/member' element={<MemberInfoPage />} />
                  <Route path='/point' element={<PointAdjustmentPage />} />
                  <Route path='/post' element={<PostPage />} />
                  <Route path='/comment' element={<CommentPage />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
