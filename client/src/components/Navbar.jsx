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
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const updateUser = () => {
      setRole(localStorage.getItem("role"));
      setName(localStorage.getItem("name"));
    };
    updateUser();
    window.addEventListener("userLogin", updateUser);
    return () => window.removeEventListener("userLogin", updateUser);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    setName("");
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
    {
      name: "Department Activities",
      path: "/activities",
      icon: <Activity className="w-4 h-4" />,
    },
    { name: "Academics", path: "/academics", icon: <BookOpen className="w-4 h-4" /> },
    { name: "Faculty", path: "/faculty", icon: <Users className="w-4 h-4" /> },
    { name: "Students", path: "/students", icon: <GraduationCap className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-[#0B3C78] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between">

        {/* LOGO */}
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="logo" className="h-10 rounded" />
          <span className="hidden sm:block text-sm font-semibold leading-tight">
            HOLY MARY INSTITUTE OF TECHNOLOGY AND SCIENCE
          </span>
        </div>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className={`flex items-center gap-1 border-b-2 pb-1 transition ${
                  location.pathname === link.path
                    ? "border-[#C79A2B]"
                    : "border-transparent hover:border-[#C79A2B]"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            </li>
          ))}

          {/* ADMIN */}
          {role === "ADMIN" && (
            <li>
              <Link
                to="/admin"
                className="flex items-center gap-1 text-yellow-300 hover:text-yellow-400"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            </li>
          )}

          {/* AUTH */}
          {role ? (
            <>
              <li className="text-[#C79A2B] font-semibold">
                {name} ({role})
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link
                to="/login"
                className="flex items-center gap-1 bg-[#C79A2B] text-[#0B3C78] px-4 py-1 rounded font-semibold hover:bg-yellow-500"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            </li>
          )}
        </ul>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0B3C78] px-4 pb-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="block py-2 border-b border-blue-900"
            >
              {link.name}
            </Link>
          ))}

          {role === "ADMIN" && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="block py-2 border-b border-blue-900 text-yellow-300"
            >
              Admin
            </Link>
          )}

          {role ? (
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 py-2 rounded mt-2"
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
      )}
    </nav>
  );
}
