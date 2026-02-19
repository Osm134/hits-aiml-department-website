import { useState, useEffect } from "react";
import API from "../API";

export default function FacultyModal({ isOpen, onClose, facultyData, refresh }) {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [subject, setSubject] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (facultyData) {
      setName(facultyData.name || "");
      setDesignation(facultyData.designation || "");
      setSubject(facultyData.subject || "");
      setImage(null);
    } else {
      setName("");
      setDesignation("");
      setSubject("");
      setImage(null);
    }
    setError("");
  }, [facultyData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("designation", designation);
      formData.append("subject", subject);
      if (image) formData.append("image", image);

      if (facultyData) {
        await API.put(`/faculty/${facultyData.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.post("/faculty", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      refresh();
      onClose();
    } catch (err) {
      console.error("Faculty save failed:", err);
      setError("Failed to save faculty");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {facultyData ? "Edit Faculty" : "Add Faculty"}
        </h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border px-3 py-2 rounded"
          />
          <input
            type="text"
            placeholder="Designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            required
            className="border px-3 py-2 rounded"
          />
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="border px-3 py-2 rounded"
          />

          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
