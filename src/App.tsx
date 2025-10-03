import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import {
  ExamReviewPage,
  MemberInfoPage,
  PointAdjustmentPage,
  SignInPage,
} from './pages';
import { Sidebar } from './components';

function App() {
  return (
    <BrowserRouter>
      <div className='flex flex-row'>
        <Sidebar />
        <Routes>
          <Route path='/' element={<SignInPage />} />
          <Route path='/exam' element={<ExamReviewPage />} />
          <Route path='/member' element={<MemberInfoPage />} />
          <Route path='/point' element={<PointAdjustmentPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
