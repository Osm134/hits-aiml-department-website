import { useState, useEffect } from "react";
import API from "../../API";

export default function ManageTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [day, setDay] = useState("Monday");
  const [slot, setSlot] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    API.get("/timetable")
      .then((res) => setTimetable(res.data))
      .catch((err) => console.log(err));
  }, []);

  const addSlot = async () => {
    if (!slot || !subject) return;
    try {
      const res = await API.post("/timetable", { day, slot, subject });
      setMessage(res.data.message);
      setTimetable([...timetable, { day, slot, subject }]);
      setSlot(""); setSubject("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error adding slot.");
    }
  };

  const deleteSlot = async (id) => {
    try {
      await API.delete(`/timetable/${id}`);
      setTimetable(timetable.filter((t) => t._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Manage Timetable</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      
      <div className="flex gap-2 mb-4">
        <select value={day} onChange={(e) => setDay(e.target.value)} className="border px-3 py-2 rounded">
          {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d => <option key={d}>{d}</option>)}
        </select>
        <input type="text" placeholder="Slot" value={slot} onChange={e => setSlot(e.target.value)} className="border px-3 py-2 rounded"/>
        <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} className="border px-3 py-2 rounded"/>
        <button onClick={addSlot} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add</button>
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Day</th>
            <th className="border px-2 py-1">Slot</th>
            <th className="border px-2 py-1">Subject</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {timetable.map((t) => (
            <tr key={t._id}>
              <td className="border px-2 py-1">{t.day}</td>
              <td className="border px-2 py-1">{t.slot}</td>
              <td className="border px-2 py-1">{t.subject}</td>
              <td className="border px-2 py-1">
                <button onClick={() => deleteSlot(t._id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
