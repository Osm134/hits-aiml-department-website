import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API";
import EventCard from "../components/EventCard";
import ActivityModal from "../components/ActivityModal";

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
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editActivity, setEditActivity] = useState(null);

  const navigate = useNavigate();

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/deptactivities");
      setActivities(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch activities:", err.response?.data || err.message);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const openAddModal = () => {
    setEditActivity(null);
    setModalOpen(true);
  };

  const openEditModal = (activity) => {
    setEditActivity(activity);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;

    const backup = [...activities];
    setActivities((prev) => prev.filter((a) => a.id !== id));

    try {
      await API.delete(`/api/deptactivities/${id}`);
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      alert("Delete failed. Restoring data.");
      setActivities(backup);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* HERO */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-12 text-center">
        <h1 className="text-4xl font-bold">Department Activities – AIML</h1>
        <p className="mt-2 text-lg">Explore • Learn • Innovate</p>
        <button
          onClick={openAddModal}
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

      {/* ACTIVITIES GRID */}
      <div className="max-w-6xl mx-auto p-8">
        {loading ? (
          <p className="text-center text-gray-500">Loading activities...</p>
        ) : !activities.length ? (
          <p className="text-center text-gray-500">No activities yet. Add one above!</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {activities.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={() => openEditModal(event)}
                onDelete={() => handleDelete(event.id)}
              />
            ))}
          </div>
        )}
      </div>

      <ActivityModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        activityData={editActivity}
        refresh={fetchActivities}
      />
    </div>
  );
}
