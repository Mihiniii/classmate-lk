import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage } from "../api/client";
import { formatDay, formatLKR, formatTimeRange } from "../utils/format";
import AppLayout, { EmptyState } from "../components/AppLayout";
import ClassForm from "../components/ClassForm";
import {
  BookIcon, CalendarIcon, ChevronRightIcon, ClockIcon, PencilIcon, PlusIcon, TrashIcon, WalletIcon,
} from "../components/Icons";

export default function DashboardPage() {
  const { user } = useAuth();
  const isTeacher = user.role === "TEACHER";
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // null = form eka close, {} = aluth class, class object = edit
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const url = user.role === "TEACHER" ? "/api/classes/my" : "/api/students/me/classes";
    api.get(url)
      .then((res) => setClasses(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
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
    <AppLayout
      title={isTeacher ? "My classes" : "Classes I'm in"}
      subtitle={isTeacher ? "Create classes and manage students, attendance and fees." : undefined}
      actions={isTeacher && (
        <button onClick={() => setEditing({})} className="btn btn-primary">
          <PlusIcon />
          New class
        </button>
      )}>
      {error && <p className="alert-error">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Loading...</p>}

      {!loading && !error && classes.length === 0 && (
        <div className="card">
          <EmptyState icon={<BookIcon className="h-6 w-6" />} title="No classes yet"
            hint={isTeacher ? "Create your first class with the “New class” button." : undefined} />
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => (
          <div key={c.id}
            className={`card flex flex-col overflow-hidden ${
              isTeacher ? "transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md" : ""
            }`}>
            <ClassInfo c={c} linked={isTeacher} />

            {isTeacher && (
              <div className="flex items-center gap-1 border-t border-slate-100 bg-slate-50/60 px-3 py-2">
                <button onClick={() => setEditing(c)} className="btn btn-ghost btn-sm">
                  <PencilIcon className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button onClick={() => handleDelete(c)} disabled={deletingId === c.id}
                  className="btn btn-danger btn-sm">
                  <TrashIcon className="h-3.5 w-3.5" />
                  {deletingId === c.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <ClassForm key={editing.id ?? "new"} existing={editing.id ? editing : null}
          onSaved={handleSaved} onCancel={() => setEditing(null)} />
      )}
    </AppLayout>
  );
}

// Teacher ta card eka click karala class details page ekata yanna puluwan
function ClassInfo({ c, linked }) {
  const info = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-slate-900">{c.subject}</h3>
          <span className="badge badge-violet mt-1.5">{c.grade}</span>
        </div>
        {linked && <ChevronRightIcon className="mt-1 h-5 w-5 shrink-0 text-slate-300" />}
      </div>

      <dl className="mt-4 space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-slate-400" />
          {formatDay(c.dayOfWeek)}
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-slate-400" />
          {formatTimeRange(c)}
        </div>
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <WalletIcon className="h-4 w-4 text-slate-400" />
          {formatLKR(c.monthlyFee)}
          <span className="font-normal text-slate-500">/ month</span>
        </div>
      </dl>
    </>
  );
  return linked
    ? <Link to={`/classes/${c.id}`} className="block flex-1 p-5">{info}</Link>
    : <div className="flex-1 p-5">{info}</div>;
}
