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
      setFacultyList(res.data || []);
    } catch (err) {
      console.error("Fetch faculty failed:", err);
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

    const backupList = [...facultyList];
    setFacultyList((prev) => prev.filter((f) => f.id !== id));

    try {
      await API.delete(`/faculty/${id}`);
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      alert("Failed to delete faculty. Restoring data.");
      setFacultyList(backupList);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold">Faculty</h1>
        <button
          onClick={openAddModal}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition w-full sm:w-auto"
        >
          Add Faculty
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-center text-gray-500">Loading faculty...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : facultyList.length === 0 ? (
        <p className="text-center text-gray-500">No faculty available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {facultyList.map((faculty) => (
            <div
              key={faculty.id}
              className="
                mx-auto 
                w-full 
                max-w-[340px] 
                sm:max-w-full
                scale-[0.95] 
                sm:scale-100
              "
            >
              <FacultyCard
                faculty={faculty}
                onEdit={() => openEditModal(faculty)}
                onDelete={() => handleDelete(faculty.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <FacultyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        facultyData={editFaculty}
        refresh={fetchFaculty}
      />
    </div>
  );
}
