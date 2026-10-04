import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import ParentDashboardPage from "./pages/ParentDashboardPage";
import ClassDetailsPage from "./pages/ClassDetailsPage";
import AttendancePage from "./pages/AttendancePage";
import PaymentsPage from "./pages/PaymentsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

// Student ta student dashboard eka, parent ta lamainge dashboard eka,
// anith ayata (teacher) class manage karana dashboard eka
function Home() {
  const { user } = useAuth();
  if (user.role === "STUDENT") return <StudentDashboardPage />;
  if (user.role === "PARENT") return <ParentDashboardPage />;
  return <DashboardPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
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