import React, { useState, useEffect } from "react";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000" });

/* ================= CREATE CLUB MODAL ================= */
function CreateClubModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/clubs", { name, description });
      onCreated(res.data); // Add new club to main list
      onClose();
      setName("");
      setDescription("");
    } catch (err) {
      console.error(err);
      alert("Failed to create club");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create Club</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Club Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <div className="flex justify-end space-x-2 mt-4">
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
}

/* ================= JOIN CLUB MODAL ================= */
function JoinClubModal({ isOpen, onClose, club, onJoined }) {
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [className, setClassName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!club) return;
    setLoading(true);
    try {
      const res = await API.post(`/clubs/${club.id}/join`, {
        name,
        roll_no: rollNo,
        class: className,
        email,
      });
      onJoined(res.data, club.id); // Pass clubId
      onClose();
      setName("");
      setRollNo("");
      setClassName("");
      setEmail("");
    } catch (err) {
      console.error(err);
      alert("Failed to join club");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !club) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Join {club.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            placeholder="Roll No"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            placeholder="Class"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
          <div className="flex justify-end space-x-2 mt-4">
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
}

/* ================= MAIN CLUBS PAGE ================= */
export default function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [clubMembers, setClubMembers] = useState({}); // { clubId: [members] }
  const [activeJoinClub, setActiveJoinClub] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Fetch all clubs
  useEffect(() => {
    API.get("/clubs").then((res) => setClubs(res.data)).catch(console.error);
  }, []);

  // Fetch members of a club
  const fetchMembers = async (clubId) => {
    try {
      const res = await API.get(`/clubs/${clubId}/members`);
      setClubMembers((prev) => ({ ...prev, [clubId]: res.data }));
    } catch (err) {
      console.error(err);
      alert("Failed to fetch members");
    }
  };

  // Delete club
  const handleDeleteClub = async (id) => {
    if (!window.confirm("Are you sure to delete this club?")) return;
    try {
      await API.delete(`/clubs/${id}`);
      setClubs((prev) => prev.filter((c) => c.id !== id));
      setClubMembers((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      console.error(err);
      alert("Failed to delete club");
    }
  };

  // Add new club locally
  const addClub = (club) => setClubs((prev) => [club, ...prev]);

  // Add member to the correct club
  const addMemberToClub = (member, clubId) => {
    setClubMembers((prev) => ({
      ...prev,
      [clubId]: [member, ...(prev[clubId] || [])],
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clubs</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
        >
          + Create Club
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {clubs.map((club) => {
          const members = clubMembers[club.id] || [];
          return (
            <div key={club.id} className="bg-white border rounded-lg shadow p-4 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">{club.name}</h2>
                <p className="text-gray-600 mb-3">{club.description}</p>
              </div>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setActiveJoinClub(club)}
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

              {members.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold">Members:</h4>
                  <ul className="text-gray-700">
                    {members.map((m) => (
                      <li key={m.id}>
                        {m.name} - {m.roll_no} - {m.class}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <CreateClubModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={addClub} />
      <JoinClubModal
        isOpen={!!activeJoinClub}
        onClose={() => setActiveJoinClub(null)}
        club={activeJoinClub}
        onJoined={addMemberToClub}
      />
    </div>
  );
}
