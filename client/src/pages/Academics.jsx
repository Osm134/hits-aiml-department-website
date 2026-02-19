import { useState, useEffect, useCallback, useRef } from "react";
import { FiUpload, FiDownload, FiTrash2, FiEye } from "react-icons/fi";

const tabs = {
  notes: "Notes",
  papers: "Question Papers",
  syllabus: "Syllabus",
  timetable: "Exam Timetable",
};

const semesters = [2, 3, 4, 5, 6, 7, 8];

export default function Academics() {
  const [activeTab, setActiveTab] = useState("notes");
  const [openSem, setOpenSem] = useState(2);
  const [data, setData] = useState([]);
  const [uploadSem, setUploadSem] = useState(null);
  const fileInputRef = useRef(null);

  const API = process.env.REACT_APP_API_URL;

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API}/${activeTab}`);
      if (!res.ok) throw new Error("Fetch failed");
      setData(await res.json());
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    }
  }, [activeTab, API]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await fetch(`${API}/${activeTab}/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

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
      const res = await fetch(`${API}/${activeTab}`, {
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center">
        HITS AIML Academic Resources
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {Object.keys(tabs).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full font-semibold transition
              ${activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-blue-500 hover:text-white"}`}
          >
            {tabs[tab]}
          </button>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/*"
        hidden
        onChange={handleFileChange}
      />

      {semesters.map((sem) => {
        const semData = data.filter((item) => Number(item.semester) === Number(sem));

        return (
          <div key={sem} className="mb-6 bg-white shadow rounded-lg">
            <button
              onClick={() => setOpenSem(sem)}
              className="w-full px-6 py-4 flex justify-between bg-gray-100"
            >
              Semester {sem}
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
                      <div key={item.id} className="p-4 bg-gray-50 rounded shadow">
                        <h2 className="font-semibold">{item.title}</h2>
                        {item.subject && (
                          <small className="text-gray-500">Subject: {item.subject}</small>
                        )}

                        <div className="flex justify-end gap-3 mt-4">
                          {item.file_url && (
                            <>
                              <a
                                href={item.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-blue-600 text-white rounded"
                              >
                                <FiEye />
                              </a>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 bg-red-600 text-white rounded"
                              >
                                <FiTrash2 />
                              </button>
                            </>
                          )}
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
