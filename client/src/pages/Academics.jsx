import { useEffect, useState } from "react";
import { FiDownload, FiTrash2, FiUpload, FiEye } from "react-icons/fi";

const semesters = [2, 3, 4, 5, 6, 7, 8];
const types = ["notes", "papers", "syllabus", "previous"];

export default function Academics() {
  const [data, setData] = useState([]);
  const [activeType, setActiveType] = useState("notes");
  const [openSem, setOpenSem] = useState(2);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({ title: "", subject: "", semester: 2, file: null });

  const API = process.env.REACT_APP_API_URL;

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/academics?type=${activeType}`);
      setData(await res.json());
    } catch (err) {
      console.error(err);
      alert("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeType]);

  const openUploadModal = (sem) => {
    setUploadData({ title: "", subject: "", semester: sem, file: null });
    setShowUpload(true);
  };

  const handleFileChange = (e) => setUploadData({ ...uploadData, file: e.target.files[0] });

  const handleUpload = async () => {
    if (!uploadData.title || !uploadData.subject || !uploadData.file) {
      return alert("All fields required");
    }
    const formData = new FormData();
    formData.append("title", uploadData.title);
    formData.append("subject", uploadData.subject);
    formData.append("semester", uploadData.semester);
    formData.append("type", activeType);
    formData.append("file", uploadData.file);

    try {
      await fetch(`${API}/academics`, { method: "POST", body: formData });
      setShowUpload(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
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

      {/* Tabs */}
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
                    onClick={() => openUploadModal(sem)}
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

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Upload File</h2>
            <input
              type="text"
              placeholder="Title"
              className="w-full mb-2 p-2 border rounded"
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Subject"
              className="w-full mb-2 p-2 border rounded"
              value={uploadData.subject}
              onChange={(e) => setUploadData({ ...uploadData, subject: e.target.value })}
            />
            <input type="file" className="mb-4" onChange={handleFileChange} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowUpload(false)} className="px-4 py-2 bg-gray-400 rounded text-white">
                Cancel
              </button>
              <button onClick={handleUpload} className="px-4 py-2 bg-green-600 rounded text-white">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
