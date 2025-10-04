import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import {
  ExamReviewPage,
  MemberInfoPage,
  PointAdjustmentPage,
  SignInPage,
  PostPage,
  CommentPage,
} from './pages';
import { Sidebar } from './components';

function App() {
  return (
    <BrowserRouter>
      <div className='flex h-screen'>
        <Sidebar />
        <Routes>
          <Route path='/' element={<SignInPage />} />
          <Route path='/exam' element={<ExamReviewPage />} />
          <Route path='/member' element={<MemberInfoPage />} />
          <Route path='/point' element={<PointAdjustmentPage />} />
          <Route path='/post' element={<PostPage />} />
          <Route path='/comment' element={<CommentPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
