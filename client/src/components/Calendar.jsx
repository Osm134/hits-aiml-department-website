export default function Calendar({ events }) {
  return (
    <div className="bg-white shadow rounded p-4 mb-6">
      <h2 className="text-xl font-bold mb-3">Academic Highlights</h2>
      <ul className="space-y-2">
        {events.map((e, idx) => (
          <li key={idx} className="flex justify-between border-b pb-2">
            <span>{e.title}</span>
            <span className="text-gray-500">{e.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
