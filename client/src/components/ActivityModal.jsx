import { useState, useEffect } from "react";
import API from "../API";

export default function ActivityModal({ open, onClose, activityData, refresh }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Events");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("/placeholder.png");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (activityData) {
      setTitle(activityData.title || "");
      setCategory(activityData.category || "Events");
      setDescription(activityData.description || "");
      setEventDate(activityData.event_date || "");
      setImage(null);
      setPreview(activityData.image_url || "/placeholder.png");
    } else {
      setTitle("");
      setCategory("Events");
      setDescription("");
      setEventDate("");
      setImage(null);
      setPreview("/placeholder.png");
    }
    setError("");
  }, [activityData]);

  if (!open) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("event_date", eventDate);
      if (image) formData.append("image", image);

      if (activityData) {
        await API.put(`/api/deptactivities/${activityData.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.post("/api/deptactivities", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      refresh();
      onClose();
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);
      setError("Failed to save activity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {activityData ? "Edit Activity" : "Add Activity"}
        </h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <div className="flex justify-center mb-4">
          <img
            src={preview}
            alt="Preview"
            className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-lg border-2 border-gray-200"
          />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border px-3 py-2 rounded"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option>Events</option>
            <option>Workshops</option>
            <option>Seminars</option>
            <option>Hackathons</option>
            <option>Clubs</option>
            <option>Achievements</option>
          </select>

          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border px-3 py-2 rounded"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border px-3 py-2 rounded"
          />

          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
