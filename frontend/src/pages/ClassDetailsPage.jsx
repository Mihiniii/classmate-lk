import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import api, { errorMessage, fieldErrors } from "../api/client";
import { validateEmail } from "../utils/validation";
import { formatDay,formatLKR, formatTimeRange, initials } from "../utils/format";
import AppLayout, { EmptyState } from "../components/AppLayout";
import ClassNotes from "../components/ClassNotes";
import {
  CalendarIcon, ClipboardCheckIcon, ClockIcon, PlusIcon, UsersIcon, WalletIcon,
} from "../components/Icons";

export default function ClassDetailsPage() {
  const { id } = useParams();
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
    const invalid = validateEmail(email, "Student email")
      || (students.some((s) => s.studentEmail.toLowerCase() === email.trim().toLowerCase())
        ? "Student is already in this class" : "");
    setAddError(invalid);
    if (invalid) return;
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
    <AppLayout backTo="/" backLabel="Back to my classes">
      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {loadError && <p className="alert-error">{loadError}</p>}

      {tuitionClass && (
        <>
          <section className="card overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-violet-600 to-indigo-500" />
            <div className="flex flex-wrap items-start justify-between gap-5 p-6">
              <div>
                <span className="badge badge-violet">{tuitionClass.grade}</span>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{tuitionClass.subject}</h1>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                    {formatDay(tuitionClass.dayOfWeek)}
                  </span>
                  <span className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-slate-400" />
                    {formatTimeRange(tuitionClass)}
                  </span>
                  <span className="flex items-center gap-2 font-semibold text-slate-900">
                    <WalletIcon className="h-4 w-4 text-slate-400" />
                    {formatLKR(tuitionClass.monthlyFee)}
                    <span className="font-normal text-slate-500">/ month</span>
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Link to={`/classes/${id}/attendance`} className="btn btn-primary">
                  <ClipboardCheckIcon />
                  Attendance
                </Link>
                <Link to={`/classes/${id}/payments`} className="btn btn-secondary">
                  <WalletIcon />
                  Payments
                </Link>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="flex items-center gap-2 font-bold text-slate-900">
                <UsersIcon className="h-5 w-5 text-slate-400" />
                Students
                <span className="badge badge-violet">{students.length}</span>
              </h2>
            </div>

            <div className="border-b border-slate-200 bg-slate-50/60 px-6 py-4">
              <form onSubmit={handleAdd} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="block flex-1">
                  <span className="label">Add a student by email</span>
                  <input type="email" maxLength={255} placeholder="student@example.com" value={email}
                    onChange={(e) => { setEmail(e.target.value); setAddError(""); }}
                    aria-invalid={!!addError} className="input" />
                </label>
                <button type="submit" disabled={adding} className="btn btn-primary">
                  <PlusIcon />
                  {adding ? "Adding..." : "Add student"}
                </button>
              </form>
              {addError && <p className="alert-error mt-3">{addError}</p>}
            </div>

            {removeError && <p className="alert-error mx-6 mt-4">{removeError}</p>}

            {students.length === 0 ? (
              <EmptyState icon={<UsersIcon className="h-6 w-6" />} title="No students in this class yet"
                hint="Add a registered student using their email address above." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {students.map((s) => (
                  <li key={s.studentId} className="flex items-center justify-between gap-4 px-6 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                        {initials(s.studentName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{s.studentName}</p>
                        <p className="truncate text-sm text-slate-500">
                          {s.studentEmail} · joined {s.joinedDate}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => handleRemove(s)} disabled={removingId === s.studentId}
                      className="btn btn-danger btn-sm shrink-0">
                      {removingId === s.studentId ? "Removing..." : "Remove"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <ClassNotes classId={id} />
        </>
      )}
    </AppLayout>
  );
}
