import axios from "axios";

export default function EventCard({ event, refresh, BASE_URL }) {
  const deleteEvent = async () => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/activities/${event.id}`);
      refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete activity");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden flex flex-col">
      {event.image_url && (
        <div className="relative w-full">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-xs">
            {event.category}
          </div>
        </div>
      )}

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-blue-700">{event.title}</h3>
        <p className="text-gray-600 mt-1 text-sm">
          {new Date(event.event_date).toLocaleDateString()}
        </p>
        <p className="text-gray-700 mt-2 text-sm flex-grow">{event.description}</p>

        <button
          onClick={deleteEvent}
          className="mt-4 bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition font-semibold text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
