// admin/AdminLayout.jsx
import { Navigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout({ children }) {
  const role = localStorage.getItem("role");

  

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="p-6 flex-grow">{children}</div>
    </div>
  );
}
