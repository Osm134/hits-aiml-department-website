import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Activity,
  BookOpen,
  Users,
  GraduationCap,
  Shield,
  LogIn,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const [role, setRole] = useState(null);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    setName(localStorage.getItem("name"));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    setName("");
    navigate("/login");
  };

  const links = [
    { name: "Home", path: "/", icon: Home },
    {
      name: "Department Activities",
      path: "/activities",
      icon: Activity,
    },
    { name: "Academics", path: "/academics", icon: BookOpen },
    { name: "Faculty", path: "/faculty", icon: Users },
    { name: "Students", path: "/students", icon: GraduationCap },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0B3C78] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 h-[104px] flex items-center justify-between">

        {/* LOGO + TITLE */}
        <div className="flex items-center gap-4 min-w-0">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="h-12 w-12 object-contain"
          />

          <div className="min-w-0">
            <p className="font-bold text-sm sm:text-base lg:text-lg leading-tight">
              HOLY MARY INSTITUTE OF TECHNOLOGY AND SCIENCE
            </p>
            <p className="text-xs sm:text-sm text-[#C79A2B] font-semibold">
              Department of Artificial Intelligence & Machine Learning
            </p>
          </div>
        </div>

        {/* ================= DESKTOP NAV ================= */}
        <ul className="hidden lg:flex items-center gap-8 text-sm font-medium">
          {links.map(({ name, path, icon: Icon }) => (
            <li key={name}>
              <Link
                to={path}
                className={`flex items-center gap-2 border-b-2 pb-1 transition
                  ${
                    location.pathname === path
                      ? "border-[#C79A2B] text-[#C79A2B]"
                      : "border-transparent hover:border-[#C79A2B]"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {name}
              </Link>
            </li>
          ))}

          {role === "ADMIN" && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full
                         bg-yellow-500/10 text-yellow-300"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}

          {role ? (
            <>
              <span className="text-xs bg-blue-900 px-4 py-1.5 rounded-full text-[#C79A2B]">
                {name} · {role}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 px-5 py-1.5 rounded-full"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-[#C79A2B] text-[#0B3C78] px-6 py-1.5 rounded-full font-bold"
            >
              Login
            </Link>
          )}
        </ul>

        {/* ================= HAMBURGER ================= */}
        <button
          className="lg:hidden p-3 rounded hover:bg-blue-900"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* ================= MOBILE DROPDOWN ================= */}
      {open && (
        <div className="lg:hidden bg-[#0B3C78] border-t border-blue-900 px-6 py-5 space-y-3">
          {links.map(({ name, path }) => (
            <Link
              key={name}
              to={path}
              onClick={() => setOpen(false)}
              className="block py-2 px-3 rounded hover:bg-blue-900"
            >
              {name}
            </Link>
          ))}

          {role === "ADMIN" && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="block py-2 px-3 text-yellow-300"
            >
              Admin Panel
            </Link>
          )}

          <div className="pt-4 border-t border-blue-900">
            {role ? (
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 py-2 rounded"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="block bg-[#C79A2B] text-[#0B3C78] text-center py-2 rounded font-semibold"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
