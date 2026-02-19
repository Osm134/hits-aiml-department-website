export default function StudentRepCard({ student, onEdit, onDelete }) {
  const imageSrc = student.image_url
    ? student.image_url.startsWith("http")
      ? student.image_url
      : `${process.env.REACT_APP_API_URL}${student.image_url}`
    : "/user-placeholder.png";

  return (
    <div className="bg-white border rounded-lg shadow hover:shadow-lg transition p-6 flex flex-col items-center">
      <div className="w-44 h-44 mb-5 relative">
        <img
          src={imageSrc}
          alt={student.name}
          onError={(e) => (e.currentTarget.src = "/user-placeholder.png")}
          className="w-full h-full object-cover rounded-full border-4 border-gray-200"
        />
      </div>
      <h2 className="text-lg font-semibold text-gray-800">{student.name}</h2>
      <p className="text-gray-500">{student.email}</p>
      <p className="text-gray-400 text-sm mt-1 text-center">Class: {student.class || "Not listed"}</p>
      <div className="flex mt-4 space-x-3">
        <button onClick={onEdit} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition">
          Edit
        </button>
        <button onClick={onDelete} className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition">
          Delete
        </button>
      </div>
    </div>
  );
}
