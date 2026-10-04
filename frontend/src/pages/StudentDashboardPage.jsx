import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage, fieldErrors } from "../api/client";
import { validateEmail } from "../utils/validation";
import { initials } from "../utils/format";
import AppLayout, { EmptyState } from "../components/AppLayout";
import StudentOverview from "../components/StudentOverview";
import { PlusIcon, UsersIcon } from "../components/Icons";

export default function StudentDashboardPage() {
  const { user } = useAuth();

  return (
    <AppLayout title={`Hello, ${user.name.trim().split(/\s+/)[0]}`}
      subtitle="Here's an overview of your classes, attendance and fees.">
      <StudentOverview basePath="/api/students/me" classesTitle="My classes"
        emptyHint="Ask your teacher to add you to a class using your email address." />
      <ParentsCard />
    </AppLayout>
  );
}

// Student ta thamange attendance saha payments balanna parents la add karaganna puluwan
function ParentsCard() {
  const [parents, setParents] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [removeError, setRemoveError] = useState("");

  useEffect(() => {
    api.get("/api/students/me/parents")
      .then((res) => setParents(res.data))
      .catch((err) => setLoadError(errorMessage(err)));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    const invalid = validateEmail(email, "Parent email")
      || (parents.some((p) => p.email.toLowerCase() === email.trim().toLowerCase())
        ? "This parent is already added" : "");
    setAddError(invalid);
    if (invalid) return;
    setAdding(true);
    try {
      const { data } = await api.post("/api/students/me/parents", { parentEmail: email.trim() });
      setParents((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setEmail("");
    } catch (err) {
      setAddError(fieldErrors(err).parentEmail ?? errorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(p) {
    if (!window.confirm(`Stop sharing your attendance and payments with ${p.name}?`)) return;
    setRemoveError("");
    setRemovingId(p.id);
    try {
      await api.delete(`/api/students/me/parents/${p.id}`);
      setParents((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err) {
      setRemoveError(errorMessage(err));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="card">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="flex items-center gap-2 font-bold text-slate-900">
          <UsersIcon className="h-5 w-5 text-slate-400" />
          Parents
          <span className="badge badge-violet">{parents.length}</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Parents you add here can see your classes, attendance and payments.
        </p>
      </div>

      <div className="border-b border-slate-200 bg-slate-50/60 px-6 py-4">
        <form onSubmit={handleAdd} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="label">Add a parent by email</span>
            <input type="email" maxLength={255} placeholder="parent@example.com" value={email}
              onChange={(e) => { setEmail(e.target.value); setAddError(""); }}
              aria-invalid={!!addError} className="input" />
          </label>
          <button type="submit" disabled={adding} className="btn btn-primary">
            <PlusIcon />
            {adding ? "Adding..." : "Add parent"}
          </button>
        </form>
        {addError && <p className="alert-error mt-3">{addError}</p>}
      </div>

      {loadError && <p className="alert-error mx-6 mt-4">{loadError}</p>}
      {removeError && <p className="alert-error mx-6 mt-4">{removeError}</p>}

      {parents.length === 0 ? (
        <EmptyState icon={<UsersIcon className="h-6 w-6" />} title="No parents added yet"
          hint="Your parent needs to register with a Parent account first, then add their email above." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {parents.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 px-6 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                  {initials(p.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{p.name}</p>
                  <p className="truncate text-sm text-slate-500">{p.email}</p>
                </div>
              </div>
              <button onClick={() => handleRemove(p)} disabled={removingId === p.id}
                className="btn btn-danger btn-sm shrink-0">
                {removingId === p.id ? "Removing..." : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
