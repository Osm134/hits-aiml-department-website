import EventForm from "./EventForm";

export default function ActivityModal({ open, onClose, refresh }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-slide-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 text-2xl hover:text-gray-700 transition"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
          Add Department Activity
        </h2>

        {/* Form */}
        <EventForm refresh={refresh} onClose={onClose} />
      </div>
    </div>
  );
}
