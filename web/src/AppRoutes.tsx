import { Navigate, Route, Routes } from 'react-router-dom';
import NotFound from '@/pages/NotFound';
import DynamicPage from '@/pages/DynamicPage';
import Login from "@/auth/Login";
import SignUp from "@/auth/Signup";
import ProtectedRoute from "@/auth/ProtectedRoute";
import ForgotPassword from "@/auth/ForgotPassword";

const AppRoutes = () => {   
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/:pageName" element={<DynamicPage />} />

      <Route path="/login" element={<ProtectedRoute requireAuth={false}><Login /></ProtectedRoute>} />
      <Route path="/signup" element={<ProtectedRoute requireAuth={false}><SignUp /></ProtectedRoute>} />
      <Route path="/forgot-password" element={<ProtectedRoute requireAuth={false}><ForgotPassword /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
