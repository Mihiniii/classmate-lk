import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage, fieldErrors } from "../api/client";

export default function ClassDetailsPage() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [tuitionClass, setTuitionClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [removeError, setRemoveError] = useState("");

  useEffect(() => {
    Promise.all([api.get(`/api/classes/${id}`), api.get(`/api/classes/${id}/students`)])
      .then(([classRes, studentsRes]) => {
        setTuitionClass(classRes.data);
        setStudents(studentsRes.data);
      })
      .catch((err) => setLoadError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAdd(e) {
    e.preventDefault();
    setAddError("");
    setAdding(true);
    try {
      const { data } = await api.post(`/api/classes/${id}/students`, { studentEmail: email.trim() });
      setStudents((prev) =>
        [...prev, data].sort((a, b) => a.studentName.localeCompare(b.studentName))
      );
      setEmail("");
    } catch (err) {
      setAddError(fieldErrors(err).studentEmail ?? errorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(s) {
    if (!window.confirm(`Remove ${s.studentName} from this class?`)) return;
    setRemoveError("");
    setRemovingId(s.studentId);
    try {
      await api.delete(`/api/classes/${id}/students/${s.studentId}`);
      setStudents((prev) => prev.filter((x) => x.studentId !== s.studentId));
    } catch (err) {
      setRemoveError(errorMessage(err));
    } finally {
      setRemovingId(null);
    }
  }

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
        <Link to="/" className="inline-block text-sm font-medium text-purple-700 hover:underline">
          ← Back to my classes
        </Link>

        {loading && <p className="text-gray-500">Loading...</p>}
        {loadError && <p className="text-red-600">{loadError}</p>}

        {tuitionClass && (
          <>
            <section className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-900">{tuitionClass.subject}</h2>
              <p className="text-sm text-gray-500">{tuitionClass.grade}</p>
              <p className="mt-2 text-sm text-gray-700">
                {tuitionClass.dayOfWeek} · {tuitionClass.startTime.slice(0, 5)}–{tuitionClass.endTime.slice(0, 5)}
              </p>
              <p className="text-sm text-purple-700 font-medium">
                LKR {tuitionClass.monthlyFee.toLocaleString()} / month
              </p>
              <div className="mt-4 flex gap-3">
                <Link to={`/classes/${id}/attendance`}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">
                  Attendance
                </Link>
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm p-5">
              <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="block flex-1">
                  <span className="text-sm font-medium text-gray-700">Student email</span>
                  <input type="email" required placeholder="student@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </label>
                <button type="submit" disabled={adding}
                  className="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700 disabled:opacity-60">
                  {adding ? "Adding..." : "Add student"}
                </button>
              </form>
              {addError && <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg p-3">{addError}</p>}
            </section>

            <section className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Students ({students.length})</h3>

              {removeError && <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg p-3">{removeError}</p>}
              {students.length === 0 && <p className="text-gray-500">No students in this class yet.</p>}

              <ul className="divide-y divide-gray-100">
                {students.map((s) => (
                  <li key={s.studentId} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{s.studentName}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {s.studentEmail} · joined {s.joinedDate}
                      </p>
                    </div>
                    <button onClick={() => handleRemove(s)} disabled={removingId === s.studentId}
                      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60">
                      {removingId === s.studentId ? "Removing..." : "Remove"}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
