import { useEffect, useState } from "react";
import axios from "axios";

export default function DailyUpdatesPage() {
  const [updates, setUpdates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: "", description: "" });
  const [newUpdate, setNewUpdate] = useState({ title: "", description: "" });

  // Fetch updates from backend
  const fetchUpdates = async () => {
    try {
      const res = await axios.get("http://localhost:5000/updates");
      setUpdates(res.data);
    } catch (err) {
      console.error("Failed to fetch updates:", err);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  // Start editing
  const handleEdit = (update) => {
    setEditingId(update.id);
    setEditData({ title: update.title, description: update.description });
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setEditData({ title: "", description: "" });
  };

  // Save changes
  const handleSave = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/updates/${id}`, editData);
      setUpdates(updates.map(u => u.id === id ? res.data : u));
      setEditingId(null);
    } catch (err) {
      console.error("Failed to save update:", err);
    }
  };

  // Delete update
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this update?")) return;
    try {
      await axios.delete(`http://localhost:5000/updates/${id}`);
      setUpdates(updates.filter(u => u.id !== id));
    } catch (err) {
      console.error("Failed to delete update:", err);
    }
  };

  // Add new update
  const handleAdd = async () => {
    if (!newUpdate.title || !newUpdate.description) return alert("Please fill all fields");
    try {
      const res = await axios.post("http://localhost:5000/updates", newUpdate);
      setUpdates([res.data, ...updates]);
      setNewUpdate({ title: "", description: "" });
    } catch (err) {
      console.error("Failed to add update:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-[#0B3C78]">Daily Updates</h1>

      {/* Add New Update */}
      <div className="bg-white shadow rounded p-4 mb-6 border">
        <h2 className="font-semibold text-lg mb-2">Add New Update</h2>
        <input
          type="text"
          placeholder="Title"
          value={newUpdate.title}
          onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
          className="border p-2 w-full rounded mb-2"
        />
        <textarea
          placeholder="Description"
          value={newUpdate.description}
          onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
          className="border p-2 w-full rounded mb-2"
        />
        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
        >
          Add Update
        </button>
      </div>

      {/* Existing Updates */}
      {updates.length === 0 ? (
        <p className="text-gray-500 text-center mt-6">No updates found.</p>
      ) : (
        updates.map((update) => (
          <div key={update.id} className="bg-white shadow rounded p-4 mb-4 border">
            {editingId === update.id ? (
              <>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="border p-2 w-full rounded mb-2"
                />
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="border p-2 w-full rounded mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(update.id)}
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-semibold text-lg">{update.title}</h2>
                <p className="text-gray-700 mb-2">{update.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(update)}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(update.id)}
                    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
