import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import EventCard from "../components/EventCard";
import ActivityModal from "../components/ActivityModal";

// Categories
const categories = [
  { name: "Events", path: "events" },
  { name: "Workshops", path: "workshops" },
  { name: "Seminars & Guest Lectures", path: "seminars" },
  { name: "Hackathons & Competitions", path: "hackathons" },
  { name: "Student Clubs & Activities", path: "clubs" },
  { name: "Department Achievements", path: "achievements" },
];

export default function DepartmentActivities() {
  const navigate = useNavigate();
  const { category } = useParams(); // <-- Get category from URL
  const [open, setOpen] = useState(false);
  const [activities, setActivities] = useState([]);

  const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/activities`);
      const allActivities = Array.isArray(res.data) ? res.data : [];

      // Filter by category if present in URL
      if (category) {
        setActivities(allActivities.filter(a => a.category.toLowerCase() === category.toLowerCase()));
      } else {
        setActivities(allActivities);
      }
    } catch (err) {
      console.error("Failed to fetch activities:", err);
      setActivities([]);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [category]); // <-- refetch when category changes

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* HERO */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold">Department Activities – AIML</h1>
        <p className="mt-2 text-lg md:text-xl">Explore • Learn • Innovate</p>

        <button
          onClick={() => setOpen(true)}
          className="mt-6 bg-white text-blue-700 px-6 py-3 rounded-full font-semibold hover:scale-105 transition"
        >
          + Add Activity
        </button>
      </div>

      {/* CATEGORY GRID */}
      <div className="max-w-6xl mx-auto p-8 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.path}
            onClick={() => navigate(`/activities/${cat.path}`)}
            className="cursor-pointer bg-white shadow rounded-xl p-6 hover:shadow-xl transition flex flex-col items-center justify-center text-center"
          >
            <h3 className="text-xl font-bold text-blue-700">{cat.name}</h3>
            <p className="text-gray-500 mt-2">View all {cat.name.toLowerCase()}</p>
          </div>
        ))}
      </div>

      {/* ACTIVITIES */}
      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Activities` : "Recent Activities"}
        </h2>

        {activities.length === 0 ? (
          <p className="text-gray-500 text-center">No activities yet. Add one above!</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {activities.map((event) => (
              <EventCard key={event.id} event={event} refresh={fetchActivities} BASE_URL={BASE_URL} />
            ))}
          </div>
        )}
      </div>

      <ActivityModal open={open} onClose={() => setOpen(false)} refresh={fetchActivities} />
    </div>
  );
}
