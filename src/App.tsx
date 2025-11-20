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
            <div className='flex flex-col h-screen overflow-hidden'>
              <Header />
              <main className='flex h-screen pt-14'>
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
