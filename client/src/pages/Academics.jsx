import { useState, useEffect, useRef, useCallback } from "react";
import { FiUpload, FiTrash2, FiDownload, FiEye } from "react-icons/fi";

const semesters = [2, 3, 4, 5, 6, 7, 8];
const types = {
  notes: "Notes",
  syllabus: "Syllabus",
  papers: "Question Papers",
  previous: "Previous Papers",
};

export default function Academics() {
  const [activeType, setActiveType] = useState("notes");
  const [openSem, setOpenSem] = useState(2);
  const [data, setData] = useState([]);
  const [uploadSem, setUploadSem] = useState(null);
  const fileInputRef = useRef(null);

  const API = process.env.REACT_APP_API_URL;

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API}/${activeType}`);
      if (!res.ok) throw new Error("Fetch failed");
      setData(await res.json());
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    }
  }, [activeType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ================= UPLOAD =================
  const startUpload = (semester) => {
    const title = prompt("Enter title");
    if (!title) return;
    setUploadSem({ semester, title });
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadSem) return;

    const formData = new FormData();
    formData.append("title", uploadSem.title);
    formData.append("semester", uploadSem.semester);
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/${activeType}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }

    e.target.value = "";
    setUploadSem(null);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await fetch(`${API}/${activeType}/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center text-gray-800">
        HITS AIML Academic Resources
      </h1>

      {/* Type Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {Object.keys(types).map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-5 py-2 rounded-full font-semibold transition ${
              activeType === type
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-blue-500 hover:text-white"
            }`}
          >
            {types[type]}
          </button>
        ))}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/*"
        hidden
        onChange={handleFileChange}
      />

      {/* Semesters */}
      {semesters.map((sem) => {
        const semData = data.filter((item) => Number(item.semester) === sem);
        return (
          <div key={sem} className="mb-6 bg-white shadow rounded-lg">
            <button
              onClick={() => setOpenSem(sem)}
              className="w-full px-6 py-4 flex justify-between bg-gray-100"
            >
              Semester {sem} {activeType && `- ${types[activeType]}`}
              <span>{openSem === sem ? "−" : "+"}</span>
            </button>

            {openSem === sem && (
              <div className="p-6">
                <div className="mb-6 flex justify-end">
                  <button
                    onClick={() => startUpload(sem)}
                    className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded"
                  >
                    <FiUpload /> Upload
                  </button>
                </div>

                {semData.length ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {semData.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded shadow flex flex-col justify-between">
                        <h2 className="font-semibold">{item.title}</h2>
                        <small className="text-gray-500">Subject: {item.subject || "N/A"}</small>
                        <div className="flex justify-end gap-3 mt-4">
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
