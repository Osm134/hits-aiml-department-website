import { useEffect, useState, useRef } from "react";
import { FiDownload, FiTrash2, FiUpload, FiEye } from "react-icons/fi";

const semesters = [2, 3, 4, 5, 6, 7, 8];
const types = ["notes", "papers", "syllabus", "previous"];

export default function Academics() {
  const [data, setData] = useState([]);
  const [activeType, setActiveType] = useState("notes");
  const [openSem, setOpenSem] = useState(2);
  const [uploadSem, setUploadSem] = useState(null);
  const fileInputRef = useRef(null);

  const API = process.env.REACT_APP_API_URL;

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/academics?type=${activeType}`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeType]);

  const startUpload = (semester) => {
    const title = prompt("Enter Title");
    const subject = prompt("Enter Subject");
    if (!title || !subject) return;
    setUploadSem({ semester, title, subject });
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    if (!e.target.files[0] || !uploadSem) return;
    const formData = new FormData();
    formData.append("title", uploadSem.title);
    formData.append("subject", uploadSem.subject);
    formData.append("semester", uploadSem.semester);
    formData.append("type", activeType);
    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch(`${API}/academics`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
    setUploadSem(null);
    e.target.value = "";
  };

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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">HITS AIML Academics</h1>

      {/* Type Tabs */}
      <div className="flex gap-3 justify-center mb-6">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-5 py-2 rounded-full font-semibold ${
              activeType === t ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-blue-500 hover:text-white"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* File input */}
      <input
        type="file"
        ref={fileInputRef}
        hidden
        onChange={handleFileChange}
        accept="application/pdf,image/*"
      />

      {/* Semesters */}
      {semesters.map((sem) => {
        const semData = data.filter((d) => d.semester === sem);
        return (
          <div key={sem} className="mb-6 bg-white shadow rounded-lg">
            <button
              onClick={() => setOpenSem(openSem === sem ? null : sem)}
              className="w-full px-6 py-4 flex justify-between bg-gray-100"
            >
              Semester {sem} {openSem === sem ? "−" : "+"}
            </button>

            {openSem === sem && (
              <div className="p-6">
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => startUpload(sem)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded"
                  >
                    <FiUpload /> Upload
                  </button>
                </div>

                {semData.length ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {semData.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded shadow flex flex-col justify-between">
                        <h2 className="font-semibold">{item.title}</h2>
                        <small className="text-gray-500">Subject: {item.subject}</small>
                        <div className="flex justify-end gap-2 mt-3">
                          <a href={item.file_url} target="_blank" rel="noreferrer" className="p-2 bg-blue-600 text-white rounded">
                            <FiEye />
                          </a>
                          <a href={item.file_url} download className="p-2 bg-green-600 text-white rounded">
                            <FiDownload />
                          </a>
                          <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-600 text-white rounded">
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400">No files uploaded</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
