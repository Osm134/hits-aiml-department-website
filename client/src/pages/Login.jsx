import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; // make sure path is correct

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [firstAdmin, setFirstAdmin] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
  const API = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if Admin exists when switching to Register
  useEffect(() => {
    const checkAdmin = async () => {
      try {
       const res = await axios.get(`${API}/admin-exists`);
        if (!res.data.exists) {
          setFirstAdmin(true);
          setForm(prev => ({ ...prev, role: "ADMIN" }));
        } else {
          setFirstAdmin(false);
          setForm(prev => ({ ...prev, role: "STUDENT" }));
        }
      } catch (err) {
        console.error("Error checking admin:", err);
      }
    };
    if (isRegister) checkAdmin();
  }, [isRegister]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const payload = { ...form };
        if (form.role === "ADMIN" && !firstAdmin) {
          payload.creatorId = Number(localStorage.getItem("userId"));
        }

          await axios.post(`${API}/register`, payload);

        // Auto-login after registration
        const res = await axios.post(`${API}/login`, {
          email: form.email,
          password: form.password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.user.role);
        localStorage.setItem("userId", res.data.user.id);
        localStorage.setItem("name", res.data.user.name);

        window.dispatchEvent(new Event("userLogin"));
        navigate("/");

      } else {
        // LOGIN
        // LOGIN
const res = await axios.post(`${API}/login`, {
  email: form.email,
  password: form.password,
});

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.user.role);
        localStorage.setItem("userId", res.data.user.id);
        localStorage.setItem("name", res.data.user.name);

        window.dispatchEvent(new Event("userLogin"));
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar at the top */}
      <Navbar />

      {/* Form centered below navbar */}
      <div className="flex items-center justify-center mt-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded shadow-md w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-center mb-6 text-[#0B3C78]">
            {isRegister ? "Register" : "Login"} - AIML Dept
          </h2>

          {error && (
            <p className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">
              {error}
            </p>
          )}

          {isRegister && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
            />
          </div>

          {isRegister && !firstAdmin && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              >
                <option value="ADMIN">Admin</option>
                <option value="FACULTY">Faculty</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B3C78] text-white py-2 rounded hover:bg-blue-900 transition mb-4"
          >
            {loading ? "Processing..." : isRegister ? "Register" : "Login"}
          </button>

          <p className="text-center text-sm">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Login" : "Register"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
