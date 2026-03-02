import { useEffect, useState } from "react";
import { FiUpload, FiTrash2, FiEye, FiEdit } from "react-icons/fi";

const semesters = [2, 3, 4, 5, 6, 7, 8];

const types = [
  { value: "previous", label: "Previous Year Questions" },
  { value: "notes", label: "Academic Calendar" },
  { value: "papers", label: "Exam Time Table" },
  { value: "syllabus", label: "Syllabus" },
];

export default function Academics() {
  const API = process.env.REACT_APP_API_URL;

  const [data, setData] = useState([]);
  const [activeType, setActiveType] = useState("notes");
  const [openSem, setOpenSem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [uploadInfo, setUploadInfo] = useState({
    semester: null,
    title: "",
    subject: "",
    file: null,
  });

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/academics`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await fetch(`${API}/academics/${id}`, {
        method: "DELETE",
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // ================= OPEN MODAL =================
  const openUploadModal = (semester, item = null) => {
    if (item) {
      setEditId(item.id);
      setUploadInfo({
        semester: item.semester,
        title: item.title,
        subject: item.subject,
        file: null,
      });
    } else {
      setEditId(null);
      setUploadInfo({
        semester,
        title: "",
        subject: "",
        file: null,
      });
    }

    setShowModal(true);
  };

  // ================= FILE CHANGE =================
  const handleFileChange = (e) => {
    setUploadInfo({ ...uploadInfo, file: e.target.files[0] });
  };

  // ================= SUBMIT =================
  const handleUpload = async () => {
    const { semester, title, subject, file } = uploadInfo;

    if (!semester || !title || !subject) {
      return alert("All fields are required");
    }

    const formData = new FormData();
    formData.append("semester", semester);
    formData.append("title", title);
    formData.append("subject", subject);
    formData.append("type", activeType);

    if (file) {
      formData.append("file", file);
    }

    try {
      const res = await fetch(
        `${API}/academics${editId ? `/${editId}` : ""}`,
        {
          method: editId ? "PUT" : "POST",
          body: formData,
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  // ================= UI =================
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        HITS AIML Academics
      </h1>

      {/* TYPE TABS */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {types.map((t) => (
          <button
            key={t.value}
            onClick={() => {
              setActiveType(t.value);
              setOpenSem(null);
            }}
            className={`px-5 py-2 rounded-full font-semibold transition ${
              activeType === t.value
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SEMESTERS */}
      {semesters.map((sem) => {
        const semData = data.filter(
          (item) => item.semester === sem && item.type === activeType
        );

        return (
          <div key={sem} className="mb-5 bg-white shadow rounded-lg overflow-hidden">
            {/* HEADER */}
            <button
              onClick={() => setOpenSem(openSem === sem ? null : sem)}
              className="w-full px-6 py-4 bg-gray-100 flex justify-between items-center font-semibold"
            >
              <span>Semester {sem}</span>
              <span>{openSem === sem ? "−" : "+"}</span>
            </button>

            {/* COLLAPSE CONTENT */}
            {openSem === sem && (
              <div className="p-6">

                {/* UPLOAD BUTTON */}
                <div className="flex justify-end mb-6">
                  <button
                    onClick={() => openUploadModal(sem)}
                    className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    <FiUpload /> Upload
                  </button>
                </div>

                {/* DATA GRID */}
                {semData.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {semData.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 p-4 rounded-lg shadow"
                      >
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-40 object-cover rounded mb-3"
                        />

                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">
                          Subject: {item.subject}
                        </p>

                        <div className="flex gap-2">
                          <a
                            href={item.image_url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-blue-600 text-white p-2 rounded"
                          >
                            <FiEye />
                          </a>

                          <button
                            onClick={() => openUploadModal(sem, item)}
                            className="bg-yellow-500 text-white p-2 rounded"
                          >
                            <FiEdit />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-600 text-white p-2 rounded"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400">
                    No content available.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              {editId ? "Update Item" : "Upload Item"}
            </h2>

            <input
              type="text"
              placeholder="Title"
              value={uploadInfo.title}
              onChange={(e) =>
                setUploadInfo({ ...uploadInfo, title: e.target.value })
              }
              className="w-full mb-3 p-2 border rounded"
            />

            <input
              type="text"
              placeholder="Subject"
              value={uploadInfo.subject}
              onChange={(e) =>
                setUploadInfo({ ...uploadInfo, subject: e.target.value })
              }
              className="w-full mb-3 p-2 border rounded"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                {editId ? "Update" : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}