import { useState } from "react";
import axios from "axios";

export default function EventForm({ onClose }) {
  const [form, setForm] = useState({
    title: "",
    category: "Events",
    description: "",
    event_date: "",
  });
  const [image, setImage] = useState(null);

  const submit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (image) data.append("image", image);

    await axios.post("https://hits-aiml-department-website.vercel.app/api/activities", data);

    onClose(); // Close modal after submitting
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        placeholder="Title"
        className="border p-2 w-full rounded-lg"
        required
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <textarea
        placeholder="Description"
        className="border p-2 w-full rounded-lg"
        required
        rows={4}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <select
        className="border p-2 w-full rounded-lg"
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        defaultValue="Events"
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
        className="border p-2 w-full rounded-lg"
        onChange={(e) => setForm({ ...form, event_date: e.target.value })}
        required
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
