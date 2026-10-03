import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage } from "../api/client";

const STATUSES = [
  { value: "PRESENT", label: "Present", active: "border-green-600 bg-green-600 text-white" },
  { value: "ABSENT", label: "Absent", active: "border-red-600 bg-red-600 text-white" },
  { value: "LATE", label: "Late", active: "border-amber-500 bg-amber-500 text-white" },
];

// Ada dawasa yyyy-mm-dd widiyata (local time; toISOString eka UTC nisa dawasa wenas wenna puluwan)
function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function AttendancePage() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [date, setDate] = useState(today);
  const [subject, setSubject] = useState("");
  const [students, setStudents] = useState([]);
  // studentId -> "PRESENT" | "ABSENT" | "LATE" (mark nokala aya meke naha)
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isFuture = date > today();

  function applyResponse(data) {
    setSubject(data.subject);
    setStudents(data.students);
    setMarks(Object.fromEntries(data.students.filter((s) => s.status).map((s) => [s.studentId, s.status])));
  }

  useEffect(() => {
    if (!date || date > today()) return;
    let ignore = false;   // date eka ikmanin wenas kaloth parana response eka ain karanna
    api.get(`/api/classes/${id}/attendance`, { params: { date } })
      .then((res) => {
        if (ignore) return;
        applyResponse(res.data);
        setError("");
      })
      .catch((err) => {
        if (!ignore) setError(errorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [id, date]);

  function handleDateChange(e) {
    setDate(e.target.value);
    setStudents([]);
    setMarks({});
    setError("");
    setSaved(false);
    setLoading(true);
  }

  function handleMark(studentId, status) {
    setMarks((prev) => ({ ...prev, [studentId]: status }));
    setSaved(false);
  }

  async function handleSave() {
    setError("");
    setSaved(false);
    setSaving(true);
    const records = students
      .filter((s) => marks[s.studentId])
      .map((s) => ({ studentId: s.studentId, status: marks[s.studentId] }));
    try {
      const { data } = await api.post(`/api/classes/${id}/attendance`, { date, records });
      applyResponse(data);
      setSaved(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const counts = { PRESENT: 0, ABSENT: 0, LATE: 0 };
  students.forEach((s) => {
    if (marks[s.studentId]) counts[marks[s.studentId]]++;
  });
  const markedCount = counts.PRESENT + counts.ABSENT + counts.LATE;
  const showList = date && !isFuture && !loading;

  return (
    <div className="min-h-screen bg-purple-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-purple-700">ClassMate LK</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name} · {user.role}</span>
            <button onClick={logout} className="text-sm font-medium text-purple-700 hover:underline">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Link to={`/classes/${id}`} className="inline-block text-sm font-medium text-purple-700 hover:underline">
          ← Back to class
        </Link>

        <section className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900">Attendance{subject && ` · ${subject}`}</h2>
          <label className="mt-3 block max-w-xs">
            <span className="text-sm font-medium text-gray-700">Date</span>
            <input type="date" required value={date} onChange={handleDateChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </label>

          {showList && students.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SummaryTile label="Present" value={counts.PRESENT} color="text-green-700" />
              <SummaryTile label="Absent" value={counts.ABSENT} color="text-red-600" />
              <SummaryTile label="Late" value={counts.LATE} color="text-amber-600" />
              <SummaryTile label="Not marked" value={students.length - markedCount} color="text-gray-600" />
            </div>
          )}
        </section>

        {isFuture && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">Cannot mark attendance for a future date</p>
        )}
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
        {date && !isFuture && loading && <p className="text-gray-500">Loading...</p>}

        {showList && !(error && students.length === 0) && (
          <section className="bg-white rounded-xl shadow-sm p-5">
            {students.length === 0 && <p className="text-gray-500">No students in this class yet.</p>}

            <ul className="divide-y divide-gray-100">
              {students.map((s) => (
                <li key={s.studentId}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-medium text-gray-900">{s.studentName}</p>
                  <div className="flex gap-2">
                    {STATUSES.map((st) => (
                      <button key={st.value} type="button" onClick={() => handleMark(s.studentId, st.value)}
                        aria-pressed={marks[s.studentId] === st.value}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                          marks[s.studentId] === st.value
                            ? st.active
                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}>
                        {st.label}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            {students.length > 0 && (
              <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-4">
                <button onClick={handleSave} disabled={saving || markedCount === 0}
                  className="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700 disabled:opacity-60">
                  {saving ? "Saving..." : "Save attendance"}
                </button>
                {saved && <span className="text-sm font-medium text-green-700">Attendance saved</span>}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function SummaryTile({ label, value, color }) {
  return (
    <div className="rounded-lg bg-purple-50 px-3 py-2">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}
