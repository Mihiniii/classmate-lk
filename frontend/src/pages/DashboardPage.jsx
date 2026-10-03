import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage } from "../api/client";
import ClassForm from "../components/ClassForm";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const isTeacher = user.role === "TEACHER";
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");
  // null = form eka close, {} = aluth class, class object = edit
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const url = user.role === "TEACHER" ? "/api/classes/my" : "/api/students/me/classes";
    api.get(url)
      .then((res) => setClasses(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, [user.role]);

  function handleSaved(saved) {
    setClasses((prev) =>
      prev.some((c) => c.id === saved.id)
        ? prev.map((c) => (c.id === saved.id ? saved : c))
        : [...prev, saved]
    );
    setEditing(null);
  }

  async function handleDelete(c) {
    if (!window.confirm(`Delete "${c.subject} (${c.grade})"? Its enrollments, attendance and payment records will be deleted too.`)) {
      return;
    }
    setError("");
    setDeletingId(c.id);
    try {
      await api.delete(`/api/classes/${c.id}`);
      setClasses((prev) => prev.filter((x) => x.id !== c.id));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDeletingId(null);
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {isTeacher ? "My classes" : "Classes I'm in"}
          </h2>
          {isTeacher && (
            <button onClick={() => setEditing({})}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">
              + New class
            </button>
          )}
        </div>

        {error && <p className="mb-4 text-red-600">{error}</p>}
        {!error && classes.length === 0 && <p className="text-gray-500">No classes yet.</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          {classes.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-900">{c.subject}</h3>
              <p className="text-sm text-gray-500">{c.grade}</p>
              <p className="mt-2 text-sm text-gray-700">
                {c.dayOfWeek} · {c.startTime.slice(0, 5)}–{c.endTime.slice(0, 5)}
              </p>
              <p className="text-sm text-purple-700 font-medium">LKR {c.monthlyFee.toLocaleString()}</p>

              {isTeacher && (
                <div className="mt-4 flex gap-4 border-t border-gray-100 pt-3">
                  <button onClick={() => setEditing(c)}
                    className="text-sm font-medium text-purple-700 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c)} disabled={deletingId === c.id}
                    className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60">
                    {deletingId === c.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {editing && (
        <ClassForm key={editing.id ?? "new"} existing={editing.id ? editing : null}
          onSaved={handleSaved} onCancel={() => setEditing(null)} />
      )}
    </div>
  );
}
