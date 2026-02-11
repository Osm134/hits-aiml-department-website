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
  const [events, setEvents] = useState([]);

  const fetch = async () => {
    const res = await axios.get("http://localhost:5000/api/activities");
    setEvents(res.data.filter((e) => e.category === mapCategory[type]));
  };

  useEffect(() => {
    fetch();
  }, [type]);

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-blue-700">
        {mapCategory[type]}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} refresh={fetch} />
        ))}
      </div>
    </div>
  );
}
