import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://hits-aiml-department-website.vercel.app/";

export default function Internships() {
  const [internships, setInternships] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    roll_no: "",
    class: "",
    company: "",
    certificate: null,
  });

  const fetchInternships = async () => {
    try {
      const res = await axios.get(`${API}/internships`);
      setInternships(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setFormData((prev) => ({ ...prev, [name]: files[0] }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) data.append(key, formData[key]);
      });

      const res = await axios.post(`${API}/internships`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setInternships((prev) => [res.data, ...prev]);
      setModalOpen(false);
      setFormData({ name: "", roll_no: "", class: "", company: "", certificate: null });
    } catch (err) {
      console.error(err);
      alert("Failed to add internship");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this internship?")) return;
    try {
      await axios.delete(`${API}/internships/${id}`);
      setInternships((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Internships</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Internship
        </button>
      </div>

      {/* Internship Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add Internship</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="text"
                name="roll_no"
                placeholder="Roll No"
                value={formData.roll_no}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="text"
                name="class"
                placeholder="Class"
                value={formData.class}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="text"
                name="company"
                placeholder="Company"
                value={formData.company}
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
                  onClick={() => setModalOpen(false)}
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
      )}

      {/* Internship List */}
      <div className="grid md:grid-cols-2 gap-4">
        {internships.length ? (
          internships.map((i) => (
            <div key={i.id} className="p-4 bg-white rounded shadow flex flex-col gap-2">
              <h3 className="font-bold">{i.name} ({i.roll_no})</h3>
              <p>Class: {i.class}</p>
              <p>Company: {i.company}</p>
              { i.certificate_url && (
  <a
    href={`${API}${i.certificate_url}`}
    target="_blank"
    rel="noreferrer"
    className="text-blue-600 underline"
  >
    View Certificate
  </a>
)}

              <button
                onClick={() => handleDelete(i.id)}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 w-fit"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center mt-10">No internships yet.</p>
        )}
      </div>
    </div>
  );
}
