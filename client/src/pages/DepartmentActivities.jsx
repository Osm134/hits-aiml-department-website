import { useEffect, useState } from "react";
import axios from "axios";
import EventCard from "../components/EventCard";
import ActivityModal from "../components/ActivityModal";
import { useNavigate } from "react-router-dom";

const categories = [
  { name: "Events", path: "events" },
  { name: "Workshops", path: "workshops" },
  { name: "Seminars", path: "seminars" },
  { name: "Hackathons", path: "hackathons" },
  { name: "Clubs", path: "clubs" },
  { name: "Achievements", path: "achievements" },
];

export default function DepartmentActivities() {
  const [activities, setActivities] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_API_URL;

  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/deptactivities`);
      setActivities(res.data);
    } catch (err) {
      console.error("Failed to fetch dept activities:", err);
      setActivities([]);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* HERO */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-12 text-center">
        <h1 className="text-4xl font-bold">Department Activities – AIML</h1>
        <p className="mt-2 text-lg">Explore • Learn • Innovate</p>
        <button
          onClick={() => setOpen(true)}
          className="mt-6 bg-white text-blue-700 px-6 py-2 rounded-full font-semibold hover:scale-105 transition"
        >
          + Add Activity
        </button>
      </div>

      {/* CATEGORY GRID */}
      <div className="max-w-6xl mx-auto p-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.path}
            onClick={() => navigate(`/activities/${cat.path}`)}
            className="cursor-pointer bg-white shadow rounded-xl p-6 hover:shadow-xl transition text-center"
          >
            <h3 className="text-xl font-bold text-blue-700">{cat.name}</h3>
            <p className="text-gray-500 mt-2">View all {cat.name.toLowerCase()}</p>
          </div>
        ))}
      </div>

      {/* ACTIVITIES */}
      <div className="max-w-6xl mx-auto p-8">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center">No activities yet. Add one above!</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {activities.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                refresh={fetchActivities}
                BASE_URL={BASE_URL}
              />
            ))}
          </div>
        )}
      </div>

      <ActivityModal open={open} onClose={() => setOpen(false)} refresh={fetchActivities} />
    </div>
  );
}
