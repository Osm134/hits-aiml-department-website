import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Faculty from "./pages/Faculty";
import Academics from "./pages/Academics";
import Login from "./pages/Login";
import Students from "./pages/Students";
import DailyUpdatesPage from "./pages/DailyUpdatesPage";

import AdminLayout from "./components/admin/AdminLayout";
import DepartmentActivities from "./pages/DepartmentActivities";
import ActivityCategory from "./pages/ActivityCategory";

// Admin Route Protection
const AdminRoute = ({ children }) => {
  const role = localStorage.getItem("role");
  if (role !== "ADMIN") return <Navigate to="/login" replace />;
  return children;
};

function AppWrapper() {
  const location = useLocation();
  const showNavbar =
    location.pathname !== "/login" &&
    !location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {showNavbar && <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/students" element={<Students />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/daily-updates" element={<DailyUpdatesPage />} />
          <Route path="/login" element={<Login />} />

          {/* Department Activities */}
          <Route path="/activities" element={<DepartmentActivities />} />
          <Route path="/activities/:type" element={<ActivityCategory />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
