import { useState, useEffect } from "react";
import API from "../../API";

export default function ManageCalendar() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    API.get("/calendar")
      .then(res => setEvents(res.data))
      .catch(err => console.log(err));
  }, []);

  const addEvent = async () => {
    if (!title || !date) return;
    try {
      const res = await API.post("/calendar", { title, date });
      setMessage(res.data.message);
      setEvents([...events, res.data.event]);
      setTitle(""); setDate("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error adding event.");
    }
  };

  const deleteEvent = async (id) => {
    try {
      await API.delete(`/calendar/${id}`);
      setEvents(events.filter(e => e._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Manage Calendar</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}

      <div className="flex gap-2 mb-4">
        <input type="text" placeholder="Event Title" value={title} onChange={e => setTitle(e.target.value)} className="border px-3 py-2 rounded"/>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border px-3 py-2 rounded"/>
        <button onClick={addEvent} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add</button>
      </div>

      <ul className="space-y-2">
        {events.map(e => (
          <li key={e._id} className="flex justify-between items-center border px-3 py-2 rounded">
            <span>{e.date}: {e.title}</span>
            <button onClick={() => deleteEvent(e._id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
