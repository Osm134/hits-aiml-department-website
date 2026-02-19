export default function FacultyCard({ faculty, onEdit, onDelete }) {
  const defaultImage = "/faculty.jpg"; // fallback image

  return (
    <div className="bg-white border rounded-lg shadow hover:shadow-lg transition p-4 sm:p-6 flex flex-col items-center">
      {/* Profile Image */}
      <div className="w-28 h-28 sm:w-44 sm:h-44 mb-4 sm:mb-5 relative">
        <img
          src={faculty.image_url || defaultImage}
          alt={faculty.name}
          className="w-full h-full object-cover rounded-full border-4 border-gray-200"
          onError={(e) => (e.target.src = defaultImage)}
        />
      </div>

      {/* Name */}
      <h2 className="text-base sm:text-lg font-semibold text-gray-800 text-center">
        {faculty.name}
      </h2>

      {/* Designation */}
      <p className="text-sm sm:text-base text-gray-500 text-center">
        {faculty.designation}
      </p>

      {/* Subjects */}
      <p className="text-xs sm:text-sm text-gray-400 mt-1 text-center px-2">
        Subjects: {faculty.subject || "Not listed"}
      </p>

      {/* Actions */}
      <div className="flex mt-3 sm:mt-4 space-x-2 sm:space-x-3">
        <button
          onClick={onEdit}
          className="bg-blue-600 text-white px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm rounded hover:bg-blue-700 transition"
        >
          Edit
        </button>

        <button
          onClick={onDelete}
          className="bg-red-600 text-white px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm rounded hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
