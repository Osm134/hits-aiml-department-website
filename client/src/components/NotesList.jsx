export default function NotesList({ notes }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note, idx) => (
        <a
          key={idx}
          href={note.file_url}
          target="_blank"
          rel="noreferrer"
          className="bg-white shadow-md rounded p-4 hover:shadow-lg transition flex flex-col justify-between"
        >
          <p className="font-semibold">{note.subject}</p>
          <small className="text-gray-500">Semester: {note.semester}</small>
        </a>
      ))}
    </div>
  );
}
