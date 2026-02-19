import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import API from "../API";
import EventCard from "../components/EventCard";

const mapCategory = {
  events: "Events",
  workshops: "Workshops",
  seminars: "Seminars",
  hackathons: "Hackathons",
  clubs: "Clubs",
  achievements: "Achievements",
};

export default function ActivityCategory() {
  const { type } = useParams();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/deptactivities");
      const filtered = res.data.filter((a) => a.category === mapCategory[type]);
      setActivities(filtered);
    } catch (err) {
      console.error("Failed to fetch activities:", err.response?.data || err.message);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-blue-700">
        {mapCategory[type]}
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : !activities.length ? (
        <p className="text-center text-gray-500">No activities in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {activities.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              refresh={fetchActivities}
            />
          ))}
        </div>
      )}
    </div>
  );
}
