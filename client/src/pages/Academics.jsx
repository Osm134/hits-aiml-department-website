import { useEffect, useState } from "react";
import { FiUpload, FiTrash2, FiEye, FiDownload } from "react-icons/fi";

const semesters = [2, 3, 4, 5, 6, 7, 8];
const types = ["notes", "papers", "syllabus", "previous"];

export default function Academics() {
  const [data, setData] = useState([]);
  const [activeType, setActiveType] = useState("notes");
  const [openSem, setOpenSem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploadInfo, setUploadInfo] = useState({ semester: null, title: "", subject: "", file: null });

  const API = process.env.REACT_APP_API_URL;

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/academics`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch academics");
    }
  };

  useEffect(() => fetchData(), []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await fetch(`${API}/academics/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const openUploadModal = (semester) => {
    setUploadInfo({ semester, title: "", subject: "", file: null });
    setShowModal(true);
  };

  const handleFileChange = (e) => setUploadInfo({ ...uploadInfo, file: e.target.files[0] });

  const handleUpload = async () => {
    const { semester, title, subject, file } = uploadInfo;
    if (!title || !subject || !file) return alert("All fields required");

    const formData = new FormData();
    formData.append("semester", semester);
    formData.append("title", title);
    formData.append("subject", subject);
    formData.append("type", activeType);
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/academics`, { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");

      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
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
            className={`px-4 py-2 rounded-full font-semibold ${activeType === t ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

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
                    onClick={() => openUploadModal(sem)}
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
                          <a href={item.file_url} target="_blank" rel="noreferrer" className="bg-blue-600 text-white p-2 rounded"><FiEye /></a>
                          <a href={item.file_url} download className="bg-green-600 text-white p-2 rounded"><FiDownload /></a>
                          <button onClick={() => handleDelete(item.id)} className="bg-red-600 text-white p-2 rounded"><FiTrash2 /></button>
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Upload Academic File</h2>

            <input type="text" placeholder="Title" value={uploadInfo.title} onChange={(e) => setUploadInfo({ ...uploadInfo, title: e.target.value })} className="w-full mb-2 p-2 border rounded" />
            <input type="text" placeholder="Subject" value={uploadInfo.subject} onChange={(e) => setUploadInfo({ ...uploadInfo, subject: e.target.value })} className="w-full mb-2 p-2 border rounded" />
            <input type="file" accept="application/pdf" onChange={handleFileChange} className="w-full mb-4" />

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
              <button onClick={handleUpload} className="px-4 py-2 bg-green-600 text-white rounded">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
