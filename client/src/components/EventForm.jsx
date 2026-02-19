import React, { useState, useEffect } from "react";

export default function EventForm({ initialData, onSubmit, onCancel, loading }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Events");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("/placeholder.png");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setCategory(initialData.category || "Events");
      setDescription(initialData.description || "");
      setEventDate(initialData.event_date || "");
      setImage(null);
      setPreview(initialData.image_url || "/placeholder.png");
    } else {
      setTitle("");
      setCategory("Events");
      setDescription("");
      setEventDate("");
      setImage(null);
      setPreview("/placeholder.png");
    }
  }, [initialData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("event_date", eventDate);
    if (image) formData.append("image", image);

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex justify-center mb-4">
        <img
          src={preview}
          alt="Preview"
          className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-lg border-2 border-gray-200"
        />
      </div>

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
          onClick={onCancel}
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
  );
}
