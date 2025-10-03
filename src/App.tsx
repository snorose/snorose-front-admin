import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import {
  ExamReviewPage,
  MemberInfoPage,
  PointAdjustmentPage,
  SignInPage,
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<SignInPage />} />
        <Route path='/exam' element={<ExamReviewPage />} />
        <Route path='/member' element={<MemberInfoPage />} />
        <Route path='/point' element={<PointAdjustmentPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
