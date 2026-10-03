import { useEffect, useState } from "react";
import { useParams } from "react-router";
import api, { errorMessage } from "../api/client";
import { initials } from "../utils/format";
import AppLayout, { EmptyState, StatCard } from "../components/AppLayout";
import { CheckIcon, UsersIcon } from "../components/Icons";

const STATUSES = [
  { value: "PRESENT", label: "Present", active: "border-emerald-600 bg-emerald-600 text-white" },
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
    <AppLayout title="Attendance" subtitle={subject || undefined}
      backTo={`/classes/${id}`} backLabel="Back to class"
      actions={
        <label className="block">
          <span className="label">Date</span>
          <input type="date" required value={date} onChange={handleDateChange} className="input w-44" />
        </label>
      }>
      {showList && students.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Present" value={counts.PRESENT} tone="green" icon={<CheckIcon className="h-5 w-5" />} />
          <StatCard label="Absent" value={counts.ABSENT} tone="red" icon={<UsersIcon className="h-5 w-5" />} />
          <StatCard label="Late" value={counts.LATE} tone="amber" icon={<UsersIcon className="h-5 w-5" />} />
          <StatCard label="Not marked" value={students.length - markedCount} tone="slate"
            icon={<UsersIcon className="h-5 w-5" />} />
        </div>
      )}

      {isFuture && <p className="alert-error">Cannot mark attendance for a future date</p>}
      {error && <p className="alert-error">{error}</p>}
      {date && !isFuture && loading && <p className="text-sm text-slate-500">Loading...</p>}

      {showList && !(error && students.length === 0) && (
        <section className="card">
          {students.length === 0 ? (
            <EmptyState icon={<UsersIcon className="h-6 w-6" />} title="No students in this class yet"
              hint="Add students from the class page before marking attendance." />
          ) : (
            <>
              <ul className="divide-y divide-slate-100">
                {students.map((s) => (
                  <li key={s.studentId}
                    className="flex flex-col gap-3 px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                        {initials(s.studentName)}
                      </span>
                      <p className="font-semibold text-slate-900">{s.studentName}</p>
                    </div>
                    <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 shadow-sm">
                      {STATUSES.map((st) => (
                        <button key={st.value} type="button" onClick={() => handleMark(s.studentId, st.value)}
                          aria-pressed={marks[s.studentId] === st.value}
                          className={`cursor-pointer border-r border-slate-300 px-4 py-1.5 text-sm font-medium transition last:border-r-0 ${
                            marks[s.studentId] === st.value
                              ? st.active
                              : "bg-white text-slate-600 hover:bg-slate-50"
                          }`}>
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between gap-4 rounded-b-2xl border-t border-slate-200 bg-slate-50 px-6 py-4">
                <p className="text-sm text-slate-500">
                  {markedCount} of {students.length} marked
                </p>
                <div className="flex items-center gap-4">
                  {saved && (
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                      <CheckIcon />
                      Attendance saved
                    </span>
                  )}
                  <button onClick={handleSave} disabled={saving || markedCount === 0} className="btn btn-primary">
                    {saving ? "Saving..." : "Save attendance"}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </AppLayout>
  );
}
