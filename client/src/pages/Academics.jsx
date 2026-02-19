import { useEffect, useState, useRef } from "react";
import { FiUpload, FiTrash2, FiEye, FiDownload } from "react-icons/fi";

const semesters = [2, 3, 4, 5, 6, 7, 8];
const types = ["notes", "papers", "syllabus", "previous"];

export default function Academics() {
  const [data, setData] = useState([]);
  const [activeType, setActiveType] = useState("notes");
  const [openSem, setOpenSem] = useState(null);
  const [uploadInfo, setUploadInfo] = useState(null);
  const fileInputRef = useRef();

  const API = process.env.REACT_APP_API_URL;

  // Fetch data
  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/academics`);
      const json = await res.json();
      setData(json);
      console.log("📄 Academics fetched:", json.length);
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      alert("Failed to fetch data");
    }
  };

  useEffect(() => fetchData(), []);

  // Delete file
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await fetch(`${API}/academics/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Delete failed");
    }
  };

  // Start upload
  const startUpload = (semester) => {
    const title = prompt("Enter title");
    const subject = prompt("Enter subject");
    if (!title || !subject) return alert("Title and Subject required");
    setUploadInfo({ semester, title, subject });
    fileInputRef.current.click();
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    if (!uploadInfo) return;
    const file = e.target.files[0];
    if (!file) return alert("Select a PDF file");

    const formData = new FormData();
    formData.append("title", uploadInfo.title);
    formData.append("semester", uploadInfo.semester);
    formData.append("subject", uploadInfo.subject);
    formData.append("type", activeType);
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/academics`, { method: "POST", body: formData });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Upload failed");
      }
      console.log("✅ Upload successful");
      setUploadInfo(null);
      fetchData();
    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert(`Upload failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">HITS AIML Academics</h1>

      {/* Type Tabs */}
      <div className="flex justify-center gap-3 mb-6">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-4 py-2 rounded-full font-semibold ${
              activeType === t ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={handleFileChange}
      />

      {/* Semesters */}
      {semesters.map((sem) => {
        const semData = data.filter((d) => d.semester === sem && d.type === activeType);
        return (
          <div key={sem} className="mb-4 bg-white shadow rounded-lg">
            <button
              className="w-full px-6 py-3 bg-gray-100 flex justify-between"
              onClick={() => setOpenSem(openSem === sem ? null : sem)}
            >
              Semester {sem} {openSem === sem ? "−" : "+"}
            </button>

            {openSem === sem && (
              <div className="p-4">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => startUpload(sem)}
                    className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    <FiUpload /> Upload
                  </button>
                </div>

                {semData.length ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {semData.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded shadow flex flex-col justify-between">
                        <p className="font-semibold">{item.title}</p>
                        <small className="text-gray-500">Subject: {item.subject}</small>
                        <div className="flex gap-2 mt-2">
                          <a href={item.file_url} target="_blank" rel="noreferrer" className="bg-blue-600 text-white p-2 rounded">
                            <FiEye />
                          </a>
                          <a href={item.file_url} download className="bg-green-600 text-white p-2 rounded">
                            <FiDownload />
                          </a>
                          <button onClick={() => handleDelete(item.id)} className="bg-red-600 text-white p-2 rounded">
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400">No files uploaded.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
