import { useState, useEffect } from "react";
import API from "../API";
import FacultyCard from "./FacultyCard";
import FacultyModal from "./FacultyModal";

export default function FacultyList() {
  const [facultyList, setFacultyList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch faculty from backend
  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await API.get("/faculty");
      setFacultyList(res.data);
    } catch (err) {
      console.error("Failed to fetch faculty:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  // Open modal for edit
  const handleEdit = (faculty) => {
    setSelectedFaculty(faculty);
    setModalOpen(true);
  };

  // Delete faculty
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this faculty?")) return;
    try {
      await API.delete(`/faculty/${id}`);
      fetchFaculty();
    } catch (err) {
      console.error("Failed to delete faculty:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Faculty List</h1>
        <button
          onClick={() => { setSelectedFaculty(null); setModalOpen(true); }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add Faculty
        </button>
      </div>

      {loading ? (
        <p>Loading faculty...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {facultyList.map((faculty) => (
            <FacultyCard
              key={faculty.id}
              faculty={faculty}
              onEdit={() => handleEdit(faculty)}
              onDelete={() => handleDelete(faculty.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <FacultyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        facultyData={selectedFaculty}
        refresh={fetchFaculty}
      />
    </div>
  );
}
