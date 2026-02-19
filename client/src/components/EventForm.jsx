import { useState } from "react";
import axios from "axios";

export default function EventForm({ onClose, refresh }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Events",
    event_date: "",
  });
  const [image, setImage] = useState(null);
  const BASE_URL = process.env.REACT_APP_API_URL;

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (image) data.append("image", image);

      await axios.post(`${BASE_URL}/api/activities`, data);
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save activity");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        placeholder="Title"
        required
        className="border p-2 w-full rounded-lg"
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <textarea
        placeholder="Description"
        required
        rows={4}
        className="border p-2 w-full rounded-lg"
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <select
        className="border p-2 w-full rounded-lg"
        defaultValue="Events"
        onChange={(e) => setForm({ ...form, category: e.target.value })}
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
        required
        className="border p-2 w-full rounded-lg"
        onChange={(e) => setForm({ ...form, event_date: e.target.value })}
      />

      <input
        type="file"
        className="w-full"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <button className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition">
        Save Activity
      </button>
    </form>
  );
}
