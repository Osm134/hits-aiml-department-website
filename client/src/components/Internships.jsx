import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Internships() {
  const [internships, setInternships] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", roll_no: "", class: "", company: "" });
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchInternships = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/internships`);
      setInternships(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setInternships([]);
    }
  }, []);

  useEffect(() => fetchInternships(), [fetchInternships]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setCertificate(files[0]);
    else setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (certificate) data.append("certificate", certificate);
      await axios.post(`${API}/internships`, data, { headers: { "Content-Type": "multipart/form-data" } });
      fetchInternships();
      setModalOpen(false);
      setForm({ name: "", roll_no: "", class: "", company: "" });
      setCertificate(null);
    } catch (err) {
      console.error(err);
      alert("Failed to add internship");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this internship?")) return;
    try {
      await axios.delete(`${API}/internships/${id}`);
      fetchInternships();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Internships</h2>
        <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded">+ Add Internship</button>
      </div>

      {internships.length === 0 ? (
        <p className="text-gray-500">No internships yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {internships.map((i) => (
            <div key={i.id} className="bg-white p-4 rounded shadow flex flex-col gap-2">
              <h3 className="font-bold">{i.name} ({i.roll_no})</h3>
              <p>Class: {i.class}</p>
              <p>Company: {i.company}</p>
              {i.certificate_url ? (
                <a href={i.certificate_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">View Certificate</a>
              ) : <span className="text-gray-400 italic">No certificate uploaded</span>}
              <button onClick={() => handleDelete(i.id)} className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 w-fit">Delete</button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add Internship</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="w-full border px-3 py-2 rounded"/>
              <input name="roll_no" placeholder="Roll No" value={form.roll_no} onChange={handleChange} required className="w-full border px-3 py-2 rounded"/>
              <input name="class" placeholder="Class" value={form.class} onChange={handleChange} required className="w-full border px-3 py-2 rounded"/>
              <input name="company" placeholder="Company" value={form.company} onChange={handleChange} required className="w-full border px-3 py-2 rounded"/>
              <input type="file" name="certificate" accept=".pdf,.jpg,.png" onChange={handleChange} className="w-full"/>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                <button type="submit" disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>{loading ? "Adding..." : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
