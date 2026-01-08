import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage, LoginPage, RegisterPage, ForgotPasswordPage, AdminPage, PTPage } from './pages/index.ts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/pt" element={<PTPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
