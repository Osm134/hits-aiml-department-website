import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [members, setMembers] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await axios.get(`${API}/clubs`);
      setClubs(res.data || []);
    } catch (err) {
      console.error("Error fetching clubs:", err);
    }
  };

  const fetchMembers = async (clubId) => {
    try {
      const res = await axios.get(`${API}/clubs/${clubId}/members`);
      setMembers(res.data || []);
      setSelectedClubId(clubId);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  const handleDeleteClub = async (id) => {
    if (!window.confirm("Are you sure you want to delete this club?")) return;
    try {
      await axios.delete(`${API}/clubs/${id}`);
      fetchClubs();
      setMembers([]);
      setSelectedClubId(null);
    } catch (err) {
      alert("Failed to delete club");
    }
  };

  // --- Create Club Modal ---
  const CreateClubModal = ({ isOpen, onClose }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        await axios.post(`${API}/clubs`, { name, description, created_by: 1 });
        fetchClubs();
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
              <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
              <button type="submit" disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // --- Join Club Modal ---
  const JoinClubModal = ({ isOpen, onClose, clubId }) => {
    const [name, setName] = useState("");
    const [rollNo, setRollNo] = useState("");
    const [className, setClassName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        await axios.post(`${API}/clubs/${clubId}/join`, { name, roll_no: rollNo, class: className, email });
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
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <input type="text" placeholder="Roll No" value={rollNo} onChange={(e) => setRollNo(e.target.value)} required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <input type="text" placeholder="Class" value={className} onChange={(e) => setClassName(e.target.value)} required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
              <button type="submit" disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>
                {loading ? "Joining..." : "Join"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-end mb-6">
        <button onClick={() => setCreateOpen(true)} className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white">+ Create Club</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <div key={club.id} className="bg-white border rounded-xl shadow p-5 flex flex-col justify-between hover:shadow-lg transition">
            <div>
              <h2 className="text-xl font-bold mb-2">{club.name}</h2>
              <p className="text-gray-600 mb-3">{club.description}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button onClick={() => { setJoinOpen(true); setSelectedClubId(club.id); }} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Join</button>
              <button onClick={() => fetchMembers(club.id)} className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">Members</button>
              <button onClick={() => handleDeleteClub(club.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
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

      <CreateClubModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <JoinClubModal isOpen={joinOpen} onClose={() => setJoinOpen(false)} clubId={selectedClubId} />
    </div>
  );
}
