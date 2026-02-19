import { useState, useEffect } from "react";
import API from "../API";

export default function StudentRepModal({ isOpen, onClose, studentData, refresh }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [className, setClassName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(studentData);

  useEffect(() => {
    if (studentData) {
      setName(studentData.name || "");
      setEmail(studentData.email || "");
      setClassName(studentData.class || "");
      setImage(null);

      // Handle Cloudinary URLs and old relative paths
      setPreview(
        studentData.image_url
          ? studentData.image_url.startsWith("http")
            ? studentData.image_url
            : `${process.env.REACT_APP_API_URL}${studentData.image_url}`
          : null
      );
    } else {
      setName("");
      setEmail("");
      setClassName("");
      setImage(null);
      setPreview(null);
    }
  }, [studentData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("class", className);
      if (image) formData.append("image", image);

      if (isEdit) {
        await API.put(`/students-rep/${studentData.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.post("/students-rep", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      refresh(); // Refresh student list
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save student representative.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{isEdit ? "Edit Student Rep" : "Add Student Rep"}</h2>
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-32 h-32 object-cover rounded mt-2 mx-auto"
            />
          )}
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
              {loading ? (isEdit ? "Updating..." : "Adding...") : isEdit ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
