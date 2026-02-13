import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Base API URL
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Internship Card Component
function InternshipCard({ internship, onDelete }) {
  return (
    <div className="p-4 bg-white rounded shadow flex flex-col gap-2">
      <h3 className="font-bold">{internship.name} ({internship.roll_no})</h3>
      <p>Class: {internship.class}</p>
      <p>Company: {internship.company}</p>

      {/* View Certificate */}
      {internship.certificate_url ? (
        <a
          href={`${API}/internships/${internship.id}/certificate`}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline"
        >
          View Certificate
        </a>
      ) : (
        <span className="text-gray-400 italic">No certificate uploaded</span>
      )}

      {/* Delete Button */}
      <button
        onClick={() => onDelete(internship.id)}
        className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 w-fit"
      >
        Delete
      </button>
    </div>
  );
}

// Add Internship Modal Component
function InternshipModal({ isOpen, onClose, refresh }) {
  const [form, setForm] = useState({
    name: "",
    roll_no: "",
    class: "",
    company: "",
  });
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);

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

      await axios.post(`${API}/internships`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onClose(); // close modal
      refresh(); // refresh list
      // Reset form
      setForm({ name: "", roll_no: "", class: "", company: "" });
      setCertificate(null);
    } catch (err) {
      console.error(err);
      alert("Failed to add internship");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add Internship</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="roll_no"
            placeholder="Roll No"
            value={form.roll_no}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="class"
            placeholder="Class"
            value={form.class}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="company"
            placeholder="Company"
            value={form.company}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="file"
            name="certificate"
            accept=".pdf,.jpg,.png"
            onChange={handleChange}
            className="w-full"
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded text-white ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Internship Page
export default function Internships() {
  const [internships, setInternships] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch internships safely
  const fetchInternships = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/internships`);
      setInternships(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch internships:", err);
      setInternships([]);
    }
  }, []);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this internship?")) return;
    try {
      await axios.delete(`${API}/internships/${id}`);
      fetchInternships(); // refresh after delete
    } catch (err) {
      console.error(err);
      alert("Failed to delete internship");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Internships</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Internship
        </button>
      </div>

      {/* Internship List */}
      {internships.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No internships yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {internships.map((i) => (
            <InternshipCard
              key={i.id}
              internship={i}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <InternshipModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        refresh={fetchInternships}
      />
    </div>
  );
}
