import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ClassDetailsPage from "./pages/ClassDetailsPage";
import AttendancePage from "./pages/AttendancePage";
import PaymentsPage from "./pages/PaymentsPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/classes/:id"
          element={<ProtectedRoute role="TEACHER"><ClassDetailsPage /></ProtectedRoute>} />
        <Route path="/classes/:id/attendance"
          element={<ProtectedRoute role="TEACHER"><AttendancePage /></ProtectedRoute>} />
        <Route path="/classes/:id/payments"
          element={<ProtectedRoute role="TEACHER"><PaymentsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}