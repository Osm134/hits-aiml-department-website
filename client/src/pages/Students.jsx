import { useState, useEffect } from "react";
import { Users, Briefcase } from "lucide-react";
import axios from "axios";
import StudentRepCard from "../components/StudentRepCard";
import StudentRepModal from "../components/StudentRepModal";
import Internship from "../components/Internships";

const API = process.env.REACT_APP_API_URL;



// --- CLUB MODALS ---
const CreateClubModal = ({ isOpen, onClose, refreshClubs }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/clubs`, { name, description, created_by: 1 });
      refreshClubs();
      onClose();
    } catch (err) {
      alert("Failed to create club");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create Club</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Club Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
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
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const JoinClubModal = ({ isOpen, onClose, clubId, fetchMembers }) => {
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [className, setClassName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/clubs/${clubId}/join`, {
        name,
        roll_no: rollNo,
        class: className,
        email,
      });
      fetchMembers(clubId);
      onClose();
    } catch (err) {
      alert("Failed to join club");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Join Club</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Roll No"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Class"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
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
              {loading ? "Joining..." : "Join"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Students() {
  const [activeTab, setActiveTab] = useState("clubs");

  // --- CLUBS STATE ---
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [members, setMembers] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  // --- STUDENTS STATE ---
  const [students, setStudents] = useState([]);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);

  // --- INTERNSHIPS STATE ---
  const [internships, setInternships] = useState([]);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchClubs();
    fetchStudents();
    fetchInternships();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await axios.get(`${API}/clubs`);
      setClubs(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMembers = async (clubId) => {
    try {
      const res = await axios.get(`${API}/clubs/${clubId}/members`);
      setMembers(res.data || []);
      setSelectedClubId(clubId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClub = async (id) => {
    if (!window.confirm("Are you sure to delete this club?")) return;
    try {
      await axios.delete(`${API}/clubs/${id}`);
      fetchClubs();
      setMembers([]);
      setSelectedClubId(null);
    } catch (err) {
      alert("Failed to delete club");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API}/students-rep`);
      setStudents(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    const backup = [...students];
    setStudents(students.filter((s) => s.id !== id));
    try {
      await axios.delete(`${API}/students-rep/${id}`);
    } catch (err) {
      alert("Delete failed. Restoring previous list.");
      setStudents(backup);
    }
  };

  const handleStudentModalClose = () => {
    setStudentModalOpen(false);
    setEditStudent(null);
    fetchStudents();
  };

  const fetchInternships = async () => {
    try {
      const res = await axios.get(`${API}/internships`);
      setInternships(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* HERO */}
      <section className="bg-[#0B3C78] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Welcome Students!</h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto">Explore clubs, internships, and student representatives.</p>
        </div>
      </section>

      {/* TABS */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          <button
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold ${
              activeTab === "clubs" ? "bg-[#0B3C78] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab("clubs")}
          >
            <Users /> Clubs
          </button>
          <button
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold ${
              activeTab === "internships" ? "bg-[#0B3C78] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab("internships")}
          >
            <Briefcase /> Internships
          </button>
          <button
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold ${
              activeTab === "students" ? "bg-[#0B3C78] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab("students")}
          >
            <Users /> CR's
          </button>
        </div>

        {/* CLUBS TAB */}
        {activeTab === "clubs" && (
          <div>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setCreateOpen(true)}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
              >
                + Create Club
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {clubs.map((club) => (
                <div key={club.id} className="bg-white border rounded-xl shadow p-5 flex flex-col justify-between hover:shadow-lg transition">
                  <div>
                    <h2 className="text-xl font-bold mb-2">{club.name}</h2>
                    <p className="text-gray-600 mb-3">{club.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => { setJoinOpen(true); setSelectedClubId(club.id); }}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Join
                    </button>
                    <button
                      onClick={() => fetchMembers(club.id)}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Members
                    </button>
                    <button
                      onClick={() => handleDeleteClub(club.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {members.length > 0 && (
              <div className="mt-8 bg-white p-5 rounded-xl shadow">
                <h3 className="text-2xl font-bold mb-4">Club Members</h3>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse border text-left">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-3 py-2">Name</th>
                        <th className="border px-3 py-2">Roll No</th>
                        <th className="border px-3 py-2">Class</th>
                        <th className="border px-3 py-2">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => (
                        <tr key={m.id}>
                          <td className="border px-3 py-2">{m.name}</td>
                          <td className="border px-3 py-2">{m.roll_no}</td>
                          <td className="border px-3 py-2">{m.class}</td>
                          <td className="border px-3 py-2">{m.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <CreateClubModal isOpen={createOpen} onClose={() => setCreateOpen(false)} refreshClubs={fetchClubs} />
            <JoinClubModal isOpen={joinOpen} onClose={() => setJoinOpen(false)} clubId={selectedClubId} fetchMembers={fetchMembers} />
          </div>
        )}

        {/* INTERNSHIPS TAB */}
        {activeTab === "internships" && <Internship internshipsProp={internships} />}

        {/* STUDENTS TAB */}
        {activeTab === "students" && (
          <div>
            <div className="flex justify-end mb-6">
              <button
                type="button"
                onClick={() => { setEditStudent(null); setStudentModalOpen(true); }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add Student
              </button>
            </div>

            {students.length > 0 ? (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => (
                  <StudentRepCard
                    key={student.id}
                    student={student}
                    onEdit={() => { setEditStudent(student); setStudentModalOpen(true); }}
                    onDelete={() => handleDeleteStudent(student.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center mt-10">No student representatives yet.</p>
            )}

            <StudentRepModal
              isOpen={studentModalOpen}
              onClose={handleStudentModalClose}
              studentData={editStudent}
              refresh={fetchStudents}
            />
          </div>
        )}
      </div>
    </div>
  );
}
