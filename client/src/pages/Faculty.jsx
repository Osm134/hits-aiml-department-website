// src/pages/Faculty.jsx
import { useState, useEffect, useCallback } from "react";
import API from "../API";
import FacultyCard from "../components/FacultyCard";
import FacultyModal from "../components/FacultyModal";

export default function Faculty() {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editFaculty, setEditFaculty] = useState(null);
  const [error, setError] = useState("");

  const fetchFaculty = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/faculty");
      console.log("Faculty API data:", res.data); // 🔍 check URLs
      setFacultyList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch faculty failed:", err.response?.data || err.message);
      setError("Failed to load faculty list");
      setFacultyList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const openAddModal = () => {
    setEditFaculty(null);
    setModalOpen(true);
  };

  const openEditModal = (faculty) => {
    setEditFaculty(faculty);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this faculty?")) return;

    const backup = [...facultyList];
    setFacultyList((prev) => prev.filter((f) => f.id !== id));

    try {
      await API.delete(`/faculty/${id}`);
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      alert("Delete failed. Restoring data.");
      setFacultyList(backup);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Faculty</h1>
        <button
          onClick={openAddModal}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Faculty
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading faculty...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : !facultyList.length ? (
        <p className="text-center text-gray-500">No faculty available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {facultyList.map((f) => (
            <FacultyCard
              key={f.id}
              faculty={f}
              onEdit={() => openEditModal(f)}
              onDelete={() => handleDelete(f.id)}
            />
          ))}
        </div>
      )}

      <FacultyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        facultyData={editFaculty}
        refresh={fetchFaculty}
      />
    </div>
  );
}
