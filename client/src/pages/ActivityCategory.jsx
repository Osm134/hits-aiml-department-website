import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
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
  const BASE_URL = process.env.REACT_APP_API_URL;

  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/deptactivities`);
      const filtered = res.data.filter((a) => a.category === mapCategory[type]);
      setActivities(filtered);
    } catch (err) {
      console.error("Failed to fetch dept activities:", err);
      setActivities([]);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [type]);

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-blue-700">
        {mapCategory[type]}
      </h1>

      {activities.length === 0 ? (
        <p className="text-gray-500 text-center">No activities in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
  );
}
