import { useEffect, useState, useCallback } from "react";
import { FiEye, FiDownload, FiTrash2, FiUpload } from "react-icons/fi";

const semesters = [2, 3, 4, 5, 6, 7, 8];

const tabs = {
  notes: "Academic Calendar",
  papers: "Question Papers",
  timetable: "Exam Timetable",
  syllabus: "Syllabus",
};

export default function Academics() {
  const [activeTab, setActiveTab] = useState("notes");
  const [openSem, setOpenSem] = useState(2);
  const [data, setData] = useState([]);

  /* ================= FETCH ================= */
  const fetchData = useCallback(async () => {
    try {
      const endpoint =
        activeTab === "notes"
          ? "notes"
          : activeTab === "papers"
          ? "papers"
          : activeTab === "timetable"
          ? "exam-timetable"
          : "syllabus";

      const res = await fetch(`http://localhost:5000/${endpoint}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file?")) return;

    const endpoint =
      activeTab === "notes"
        ? "notes"
        : activeTab === "papers"
        ? "papers"
        : activeTab === "timetable"
        ? "exam-timetable"
        : "syllabus";

    try {
      const res = await fetch(`http://localhost:5000/${endpoint}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete file");
    }
  };

  /* ================= UPLOAD PDF ================= */
  const uploadPDF = (semester) => {
    const title = prompt("Enter title");
    if (!title) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf,image/*";

    input.onchange = async () => {
      if (!input.files || input.files.length === 0) return;

      const formData = new FormData();
      formData.append("title", title);
      formData.append("semester", semester);
      formData.append("file", input.files[0]);

      const endpoint =
        activeTab === "notes"
          ? "notes"
          : activeTab === "papers"
          ? "papers"
          : activeTab === "timetable"
          ? "exam-timetable"
          : "syllabus";

      try {
        const res = await fetch(`http://localhost:5000/${endpoint}`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");

        await res.json();
        fetchData();
      } catch (err) {
        console.error(err);
        alert("Failed to upload file");
      }

      input.value = "";
    };

    input.click();
  };

  /* ================= FILTER ================= */
  const semData = data.filter((item) => Number(item.semester) === Number(openSem));

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center text-gray-800">
        HITS AIML Academic Resources
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {Object.keys(tabs).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full font-semibold transition-colors duration-200
              ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white"
              }`}
          >
            {tabs[tab]}
          </button>
        ))}
      </div>

      {/* Semesters */}
      {semesters.map((sem) => (
        <div key={sem} className="mb-6 bg-white shadow-lg rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenSem(sem)}
            className="w-full px-6 py-4 flex justify-between items-center text-lg font-semibold bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Semester {sem}
            <span className="text-2xl font-bold">{openSem === sem ? "−" : "+"}</span>
          </button>

          {openSem === sem && (
            <div className="p-6 border-t">
              {/* Upload Button */}
              <div className="mb-6 flex justify-end">
                <button
                  onClick={() => uploadPDF(sem)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition-all"
                >
                  <FiUpload size={20} /> Upload
                </button>
              </div>

              {/* Files Grid */}
              {semData.length ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {semData.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-gray-50 rounded-xl shadow-md flex flex-col justify-between hover:shadow-xl transition-shadow"
                    >
                      <div className="mb-4">
                        <h2 className="font-semibold text-lg text-gray-800">{item.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">Semester: {item.semester}</p>
                      </div>

                      <div className="flex justify-end gap-3">
                        {item.file_url && (
                          <>
                            <a
                              href={`http://localhost:5000/download/${activeTab}/${item.id}`}
                              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                              <FiDownload size={18} />
                            </a>

                            <a
                              href={`http://localhost:5000${item.file_url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              <FiEye size={18} />
                            </a>
                          </>
                        )}

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 mt-4 text-lg">
                  No files uploaded for this semester.
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
