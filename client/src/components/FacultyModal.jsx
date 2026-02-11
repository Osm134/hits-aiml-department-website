import { useState, useEffect } from "react";
import API from "../API";

export default function FacultyModal({ isOpen, onClose, facultyData, refresh }) {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [subject, setSubject] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(facultyData);

 useEffect(() => {
  if (facultyData) {
    setName(facultyData.name || "");
    setDesignation(facultyData.designation || "");
    setSubject(facultyData.subject || "");
    setImage(null); // keep old image if no change
  } else {
    setName(""); setDesignation(""); setSubject(""); setImage(null);
  }
}, [facultyData, isOpen]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("designation", designation);
    formData.append("subject", subject);
    if (image) formData.append("image", image);

    let response;
    if (facultyData) {
      response = await API.put(`/faculty/${facultyData.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      response = await API.post("/faculty", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    console.log("Saved:", response.data);
    refresh(); // reload faculty list
    onClose();
  } catch (err) {
    console.error(err);
    alert("Failed to save faculty. Check console.");
  } finally {
    setLoading(false);
  }
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{isEdit ? "Edit Faculty" : "Add Faculty"}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required className="w-full border px-3 py-2 rounded" />
          <input type="text" placeholder="Designation" value={designation} onChange={e => setDesignation(e.target.value)} required className="w-full border px-3 py-2 rounded" />
          <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} required className="w-full border px-3 py-2 rounded" />
          <input type="file" name="image" accept="image/*" onChange={e => setImage(e.target.files[0])} className="w-full" />
          {image && <img src={URL.createObjectURL(image)} alt="preview" className="w-32 h-32 object-cover rounded mt-2" />}
          <div className="flex justify-end space-x-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
            <button type="submit" disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>
              {loading ? (isEdit ? "Updating..." : "Adding...") : isEdit ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
