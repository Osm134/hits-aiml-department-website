import { useState, useEffect, useRef } from "react";
import { FiDownload, FiTrash2, FiUpload, FiEye } from "react-icons/fi";

const semesters = [2, 3, 4, 5, 6, 7, 8];
const types = [
  { key: "notes", label: "Notes" },
  { key: "papers", label: "Question Papers" },
  { key: "syllabus", label: "Syllabus" },
  { key: "previous", label: "Previous QPs" },
];

const API = process.env.REACT_APP_API_URL;

export default function Academics() {
  const [activeType, setActiveType] = useState("notes");
  const [openSem, setOpenSem] = useState(2);
  const [data, setData] = useState([]);
  const [uploadInfo, setUploadInfo] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch data by type
  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/academics/${activeType}`);
      if (!res.ok) throw new Error("Fetch failed");
      setData(await res.json());
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeType]);

  // Handle delete
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

  // Start upload
  const startUpload = (semester) => {
    const title = prompt("Enter title");
    const subject = prompt("Enter subject");
    if (!title || !subject) return;
    setUploadInfo({ semester, title, subject });
    fileInputRef.current.click();
  };

  // Upload file
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadInfo) return;

    const formData = new FormData();
    formData.append("title", uploadInfo.title);
    formData.append("subject", uploadInfo.subject);
    formData.append("semester", uploadInfo.semester);
    formData.append("type", activeType);
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/academics`, { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }

    e.target.value = "";
    setUploadInfo(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center">
        HITS AIML Academics
      </h1>

      {/* Type Tabs */}
      <div className="flex justify-center gap-4 mb-6">
        {types.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveType(t.key)}
            className={`px-5 py-2 rounded-full font-semibold transition ${
              activeType === t.key
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-blue-500 hover:text-white"
            }`}
          >
            {t.label}
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
        const semData = data.filter((item) => Number(item.semester) === Number(sem));
        return (
          <div key={sem} className="mb-6 bg-white shadow rounded-lg">
            <button
              onClick={() => setOpenSem(sem)}
              className="w-full px-6 py-4 flex justify-between bg-gray-100 font-semibold"
            >
              Semester {sem}
              <span>{openSem === sem ? "−" : "+"}</span>
            </button>

            {openSem === sem && (
              <div className="p-6">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => startUpload(sem)}
                    className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded"
                  >
                    <FiUpload /> Upload PDF
                  </button>
                </div>

                {semData.length ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {semData.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded shadow flex flex-col justify-between">
                        <h2 className="font-semibold">{item.title}</h2>
                        <p className="text-sm text-gray-600">Subject: {item.subject}</p>
                        <div className="flex justify-end gap-2 mt-4">
                          {item.file_url && (
                            <>
                              <a
                                href={item.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-blue-600 text-white rounded"
                                title="View"
                              >
                                <FiEye />
                              </a>
                              <a
                                href={item.file_url}
                                download
                                className="p-2 bg-green-600 text-white rounded"
                                title="Download"
                              >
                                <FiDownload />
                              </a>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-red-600 text-white rounded"
                            title="Delete"
                          >
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
