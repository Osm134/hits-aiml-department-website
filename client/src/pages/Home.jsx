import { Link, useNavigate } from "react-router-dom";
import { Book, FileText, Calendar, ClipboardList, File, Edit, Plus, Trash2, Download } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import API from "../API";


// Returns correct image URL for faculty
const getFacultyImageURL = (path) => {
  if (!path) return "/faculty.jpg"; // fallback
  if (path.startsWith("http") || path.startsWith("https")) return path; // full URL
  return `${API.baseURL}${path}`; // relative path from backend
};
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/";


// -------------------- REUSABLE FETCH HOOK --------------------
// -------------------- REUSABLE FETCH HOOK --------------------
const useFetch = (endpoint, limit = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get(endpoint); // use central API
      setData(limit ? res.data.slice(0, limit) : res.data);
    } catch (err) {
      console.error(`Failed to fetch ${endpoint}:`, err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, refetch: fetchData };
};


// -------------------- HOME COMPONENT --------------------
export default function Home() {
  const navigate = useNavigate();

  /* -------------------- DATA HOOKS -------------------- */
 const { data: updates, loading: loadingUpdates } = useFetch("/updates", 3);
const { data: events, refetch: refetchEvents } = useFetch("/events");
const { data: facultyList, loading: loadingFaculty } = useFetch("/faculty");

  /* -------------------- HIGHLIGHT STATE -------------------- */
  const [highlight, setHighlight] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [highlightTitle, setHighlightTitle] = useState("");
  const [highlightDesc, setHighlightDesc] = useState("");
const [highlightLink, setHighlightLink] = useState("");
  /* -------------------- EVENT MODAL STATE -------------------- */
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
const [eventForm, setEventForm] = useState({
  title: "",
  description: "",
  date: "",
  image: null
});
  /* -------------------- CAROUSEL STATE -------------------- */
  const [activeEvent, setActiveEvent] = useState(0);
  const eventTimerRef = useRef(null);

  /* -------------------- FETCH HIGHLIGHT -------------------- */
  useEffect(() => {
    const fetchHighlight = async () => {
      try {
        const res = await API.get("/academic-highlights");
        if (res.data.length) setHighlight(res.data[0]);
      } catch (err) {
        console.error("Failed to fetch academic highlight:", err);
      }
    };
    fetchHighlight();
  }, []);

  /* -------------------- AUTOMATIC EVENT SLIDE -------------------- */
  useEffect(() => {
    if (!events || events.length === 0) return;
    eventTimerRef.current = setInterval(() => {
      setActiveEvent(prev => (prev + 1) % events.length);
    }, 4000);
    return () => clearInterval(eventTimerRef.current);
  }, [events]);

  /* -------------------- EVENT HANDLERS -------------------- */
  const openAddEvent = () => {
    setEditingEvent(null);
    setEventForm({ title: "", description: "", date: "", image: null, file: null });
    setEventModalOpen(true);
  };

  const openEditEvent = (event) => {
  setEditingEvent(event);
  setEventForm({
    title: event.title,
    description: event.description,
    date: event.date ? event.date.split("T")[0] : "",
    image: null
  });
  setEventModalOpen(true);
};

 const handleEventChange = (e) => {
  const { name, value, files } = e.target;

  setEventForm(prev => ({
    ...prev,
    [name]: files ? files[0] : value
  }));
};
const saveEvent = async () => {
  const { title, description, date, image } = eventForm;

  if (!title || !date) {
    alert("Title and Date are required!");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("date", date);
  if (image) formData.append("image", image);

  try {
    if (editingEvent) {
      await API.put(`/events/${editingEvent.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await API.post("/events", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    refetchEvents();
    setEventModalOpen(false);
  } catch (err) {
    console.error("Failed to save event:", err);
    alert("Save failed. Try again!");
  }
};

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await API.delete(`/events/${id}`);
      refetchEvents();
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Delete failed. Try again!");
    }
  };

  const goToEvent = (index) => {
    setActiveEvent(index);
    clearInterval(eventTimerRef.current);
    eventTimerRef.current = setInterval(() => {
      setActiveEvent(prev => (prev + 1) % events.length);
    }, 4000);
  };

  /* -------------------- SAVE HIGHLIGHT -------------------- */
  const saveHighlight = async () => {
    if (!highlightTitle.trim() || !highlightDesc.trim()) return alert("Please enter both title and description!");
    try {
      await API.post("/academic-highlights", {
  title: highlightTitle,
  description: highlightDesc,
  link: highlightLink || null, // add state for link if needed
});
      const res = await API.get("/academic-highlights");
      setHighlight(res.data[0]);
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to save highlight:", err);
      alert("Failed to save. Try again!");
    }
  };

  /* -------------------- QUICK LINKS -------------------- */
 const quickLinks = [
  { title: "Previous Papers", path: "/academics", state: { section: "papers" }, icon: <FileText className="w-8 h-8 mb-1" />, color: "from-green-400 to-green-600" },
  { title: "Exam Timetable", path: "/academics", state: { section: "timetable" }, icon: <Calendar className="w-8 h-8 mb-1" />, color: "from-yellow-400 to-yellow-600" },
  { title: "Academic Calendar", path: "/academics", state: { section: "calendar" }, icon: <ClipboardList className="w-8 h-8 mb-1" />, color: "from-purple-400 to-purple-600" },
  { title: "Syllabus", path: "/academics", state: { section: "syllabus" }, icon: <File className="w-8 h-8 mb-1" />, color: "from-pink-400 to-pink-600" },
];

  return (
    <div className="bg-gray-50 font-sans text-gray-800 min-h-screen">

      {/* -------------------- HERO SECTION -------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8 grid md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0B3C78] leading-tight">
            Welcome to the HITS AIML Department
          </h1>
          <p className="text-base sm:text-lg text-gray-700">Artificial Intelligence & Machine Learning</p>
          <p className="italic text-gray-500">Innovate. Inspire. Achieve.</p>
          <button onClick={() => navigate("/academics")} className="mt-4 px-6 py-3 bg-[#0B3C78] text-white rounded-lg shadow hover:bg-blue-900 transition">
            Explore Academics
          </button>
        </div>
       <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

  {/* IMAGE */}
  <div className="w-full h-56 sm:h-64 md:h-72 bg-gray-100 flex items-center justify-center">
    <img
      src="/hod.jpg"
      alt="Dr. Sumitha Bhashini - HOD AIML"
      className="h-full w-auto object-contain"
    />
  </div>

  {/* CONTENT */}
  <div className="px-5 py-4 text-center">
    <h3 className="text-base sm:text-lg font-semibold text-[#0B3C78]">
      Dr. Sumitha Bhashini
    </h3>

    <p className="mt-1 text-sm text-gray-600 font-medium">
      Head of the Department
    </p>

    <p className="text-sm text-gray-500">
      Artificial Intelligence & Machine Learning
    </p>

    <div className="w-12 h-[2px] bg-[#C79A2B] mx-auto my-3"></div>

    
  </div>

</div>

      </div>

      {/* -------------------- UPDATES + HIGHLIGHT -------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-6 mb-12">
        {/* Daily Updates */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-4 flex flex-col">
          <div className="bg-[#0B3C78] text-white px-4 py-2 font-semibold rounded-t-2xl text-lg">Daily Updates</div>
          <div className="p-4 space-y-4 overflow-y-auto max-h-52">
            {loadingUpdates ? <p className="text-gray-500 text-sm">Loading updates...</p> :
              updates.length === 0 ? <p className="text-gray-500 text-sm">No updates found.</p> :
                updates.map(u => (
                  <div key={u.id} className="border-b pb-2 last:border-b-0 relative">
                    <h3 className="font-semibold text-gray-800 text-base">{u.title}</h3>
                    <p className="text-gray-700 text-sm line-clamp-2">{u.description}</p>
                    {u.file_url && (
                      <a href={`${API.baseURL}${u.file_url}`} download className="absolute top-0 right-0 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Download className="w-3 h-3" /> Download
                      </a>
                    )}
                  </div>
                ))}
          </div>
          <div className="text-center mt-3">
            <button onClick={() => navigate("/daily-updates")} className="bg-[#0B3C78] hover:bg-blue-900 text-white px-4 py-1 rounded-lg text-sm transition">
              View All
            </button>
          </div>
        </div>

        {/* Academic Highlight */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition">
          <div className="bg-[#D97706] text-white px-4 py-2 font-semibold rounded-t-2xl text-lg flex justify-between items-center">
            Academic Highlights
            <button onClick={() => { setHighlightTitle(highlight?.title || ""); setHighlightDesc(highlight?.description || ""); setModalOpen(true); }} className="hover:bg-orange-700 p-1 rounded">
              <Edit className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="p-4 space-y-3 text-gray-700 text-base max-h-44 overflow-y-auto">
            {highlight ? (
              <>
                <p className="line-clamp-2"><span className="font-semibold">Title:</span> {highlight.title}</p>
                <p className="line-clamp-3"><span className="font-semibold">Description:</span> {highlight.description}</p>
              </>
            ) : <p className="text-gray-500">No academic highlight available.</p>}
          </div>
        </div>
      </div>

      {/* -------------------- EVENTS CAROUSEL -------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-4 mb-12">
        <div className="flex justify-between items-center bg-[#0B3C78] text-white px-4 py-2 font-semibold rounded-t-2xl text-lg">
          Upcoming Activities
          <button onClick={openAddEvent} className="flex items-center gap-1 px-2 py-1 bg-green-600 rounded hover:bg-green-700">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-500 text-sm mt-4 text-center">No upcoming activities.</p>
        ) : (
          <div className="mt-4 relative flex flex-col items-center w-full">
            <div className="w-full max-w-3xl bg-gray-50 rounded-2xl shadow-lg transition transform hover:scale-105 overflow-hidden flex flex-col animate-slide-in">
              <div className="w-full overflow-hidden rounded-t-2xl">
<img
  src={events[activeEvent].image_url || "/placeholder.jpg"}
  alt={events[activeEvent].title}
  className="w-full h-auto object-contain"
/>

              </div>
              <div className="p-4 flex flex-col gap-2">
                <h3 className="font-semibold text-gray-800 text-xl">{events[activeEvent].title}</h3>
                <p className="text-gray-500 text-sm">{events[activeEvent].date}</p>
                <p className="text-gray-700 text-sm">{events[activeEvent].description}</p>
                <div className="flex justify-between items-center mt-3">
                  {events[activeEvent].file_url && (
                    <a href={`${API.baseURL}${events[activeEvent].file_url}`} download className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                      <Download className="w-3 h-3" /> Download
                    </a>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => openEditEvent(events[activeEvent])} className="p-1 bg-yellow-500 rounded hover:bg-yellow-600">
                      <Edit className="w-4 h-4 text-white" />
                    </button>
                    <button onClick={() => deleteEvent(events[activeEvent].id)} className="p-1 bg-red-600 rounded hover:bg-red-700">
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center items-center gap-3 mt-4">
              {events.map((_, idx) => (
                <button key={idx} onClick={() => goToEvent(idx)} className={`w-3 h-3 rounded-full ${activeEvent === idx ? "bg-[#0B3C78]" : "bg-gray-400"}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* -------------------- EVENT MODAL -------------------- */}
{/* -------------------- EVENT MODAL -------------------- */}
{eventModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
      <h2 className="text-xl font-bold mb-4">{editingEvent ? "Edit Event" : "Add Event"}</h2>

      <input
        type="text"
        name="title"
        placeholder="Title"
        value={eventForm.title}
        onChange={handleEventChange}
        className="w-full mb-2 border rounded px-2 py-1"
      />
      <textarea
        name="description"
        placeholder="Description"
        value={eventForm.description}
        onChange={handleEventChange}
        className="w-full mb-2 border rounded px-2 py-1"
      />
      <input
        type="date"
        name="date"
        value={eventForm.date}
        onChange={handleEventChange}
        className="w-full mb-2 border rounded px-2 py-1"
      />

      <label className="block mb-4">
        Event Photo:
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleEventChange}
          className="mt-1"
        />
      </label>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setEventModalOpen(false)}
          className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={saveEvent}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}



     {/* -------------------- FACULTY SPOTLIGHT -------------------- */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative">
  <h2 className="text-3xl font-bold mb-6 text-[#0B3C78] text-center">Faculty Spotlight</h2>
  
  {loadingFaculty ? (
    <p className="text-center">Loading faculty...</p>
  ) : facultyList.length === 0 ? (
    <p className="text-center">No faculty available.</p>
  ) : (
    <div className="flex space-x-6 overflow-x-auto py-2">
      {facultyList.map(f => (
        <div key={f.id} className="min-w-[200px] bg-white rounded-3xl shadow-xl overflow-hidden transform hover:scale-105 transition duration-300">
          
          {/* IMAGE WITH CLOUDINARY FALLBACK */}
          <img
            src={
              f.image_url
                ? f.image_url.startsWith("http")  // full URL
                  ? f.image_url
                  : `${BASE_URL}${f.image_url}` // relative path from backend
                : "/faculty.jpg" // fallback
            }
            alt={f.name}
            className="w-full h-48 object-cover"
          />

          <div className="bg-[#0B3C78] text-white py-2 text-center">
            <h3 className="font-semibold text-md">{f.name}</h3>
            <p className="text-sm">{f.designation}</p>
            <p className="text-sm">{f.subject}</p>
          </div>
        </div>
      ))}
    </div>
  )}

  <button
    onClick={() => navigate("/faculty")}
    className="fixed right-5 bottom-20 bg-[#0B3C78] text-white px-5 py-3 rounded-3xl shadow-lg hover:bg-blue-900 transition z-50"
  >
    View All Faculty
  </button>
</div>

      {/* -------------------- QUICK LINKS -------------------- */}
     {/* -------------------- QUICK LINKS -------------------- */}
<h2 className="text-2xl sm:text-3xl font-bold mb-6 text-[#0B3C78] text-center">
  QUICK LINKS
</h2>

<div className="
  max-w-6xl mx-auto px-4 sm:px-6 
  grid grid-cols-2 
  sm:grid-cols-2 
  md:grid-cols-4 
  gap-4 sm:gap-6 
  mb-12
">
  {quickLinks.map((link, idx) => (
    <Link
      key={idx}
      to={link.path}
      state={link.state}
      className={`
        flex flex-col items-center justify-center 
        p-5 sm:p-6 
        rounded-2xl 
        text-white font-semibold 
        shadow-lg 
        hover:scale-105 active:scale-95
        transition-transform duration-200
        bg-gradient-to-br ${link.color}
      `}
    >
      {link.icon}
      <span className="text-center text-sm sm:text-base">
        {link.title}
      </span>
    </Link>
  ))}
</div>


      {/* -------------------- FOOTER -------------------- */}
      <footer className="bg-[#0B3C78] text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-lg">AIML Department</h3>
            <p>Email: info@aimlcollege.edu</p>
            <p>Phone: +91 12345 67890</p>
            <p>Address: AIML College, City, State</p>
          </div>
          <div className="space-y-2 mt-4 md:mt-0 text-right">
            <p>Follow us:</p>
            <div className="flex space-x-4 justify-end">
              <a href="#" className="hover:underline">Facebook</a>
              <a href="#" className="hover:underline">Twitter</a>
              <a href="#" className="hover:underline">Instagram</a>
            </div>
          </div>
        </div>
        <div className="text-center mt-6 text-sm">
          &copy; {new Date().getFullYear()} AIML Department. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
