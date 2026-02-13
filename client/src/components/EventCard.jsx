import axios from "axios";

export default function EventCard({ event, refresh }) {
  const deleteEvent = async () => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    await axios.delete(`https://hits-aiml-department-website.onrender.com/api/activities/${event.id}`);
    refresh();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden flex flex-col w-full max-w-md mx-auto md:mx-0 animate-slide-in">
      
      {/* IMAGE */}
      {event.image_url && (
        <div className="relative w-full">
          <img
            src={`https://hits-aiml-department-website.onrender.com${event.image_url}`}
            alt={event.title}
            className="w-full h-auto object-contain object-center transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-white text-xs sm:text-sm">
            {event.category}
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-base sm:text-lg text-blue-700">{event.title}</h3>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          {new Date(event.event_date).toLocaleDateString()}
        </p>
        <p className="text-gray-700 mt-2 text-sm sm:text-base flex-grow">{event.description}</p>

        <button
          onClick={deleteEvent}
          className="mt-4 bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition font-semibold text-sm sm:text-base"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
