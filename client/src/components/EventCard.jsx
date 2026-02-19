import React from "react";

export default function EventCard({ event, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden flex flex-col">
      {/* IMAGE */}
      <img
        src={event.image_url || "/placeholder.png"}
        alt={event.title}
        className="w-full h-48 object-cover"
      />

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-blue-700">{event.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{event.category}</p>
        {event.event_date && (
          <p className="text-sm text-gray-400 mt-1">Date: {event.event_date}</p>
        )}
        <p className="text-gray-600 mt-2 flex-1">{event.description}</p>

        {/* ACTIONS */}
        <div className="mt-4 flex justify-end gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
