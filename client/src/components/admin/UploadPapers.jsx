import { useState } from "react";
import API from "../../API";

export default function UploadPapers() {
  const [title, setTitle] = useState("");
  const [semester, setSemester] = useState(1);
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMessage("Please select a PDF file.");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("semester", semester);
    formData.append("subject", subject);
    formData.append("file", file);

    try {
      const res = await API.post("/papers", formData);
      setMessage(res.data.message);
      setTitle(""); setSemester(1); setSubject(""); setFile(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error uploading paper.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Upload Papers</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Upload
        </button>
      </form>
    </div>
  );
}
