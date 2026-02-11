import { NavLink } from "react-router-dom";

export default function AdminNavbar() {
  const links = [
    { path: "/admin/dashboard", label: "Dashboard" },
    { path: "/admin/uploadnotes", label: "Upload Notes" },
    { path: "/admin/uploadpapers", label: "Upload Papers" },
    { path: "/admin/updates", label: "Daily Updates" },
    { path: "/admin/managetimetable", label: "Manage Timetable" },
    { path: "/admin/managecalendar", label: "Manage Calendar" },
  ];

  return (
    <nav className="bg-[#0B3C78] text-white flex space-x-4 px-6 py-4 fixed w-full top-0 z-50">
      {links.map(link => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `px-3 py-2 rounded hover:bg-blue-900 transition ${
              isActive ? "bg-blue-900 font-bold" : ""
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
