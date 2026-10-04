import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage } from "../api/client";
import { initials } from "../utils/format";
import AppLayout, { EmptyState } from "../components/AppLayout";
import StudentOverview from "../components/StudentOverview";
import { UsersIcon } from "../components/Icons";

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    api.get("/api/parents/me/children")
      .then((res) => {
        setChildren(res.data);
        setSelectedId(res.data[0]?.id ?? null);
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const child = children.find((c) => c.id === selectedId);

  return (
    <AppLayout title={`Hello, ${user.name.trim().split(/\s+/)[0]}`}
      subtitle="Follow your child's classes, attendance and fees.">
      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {error && <p className="alert-error">{error}</p>}

      {!loading && !error && children.length === 0 && (
        <div className="card">
          <EmptyState icon={<UsersIcon className="h-6 w-6" />} title="No children linked yet"
            hint={`Ask your child to log in to their student account and add you as a parent using your email address (${user.email}).`} />
        </div>
      )}

      {children.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {children.map((c) => (
            <button key={c.id} type="button" onClick={() => setSelectedId(c.id)}
              className={`card flex cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition ${
                c.id === selectedId ? "border-violet-500 ring-2 ring-violet-500/30" : "hover:border-violet-300"
              }`}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                {initials(c.name)}
              </span>
              <span className="text-sm font-semibold text-slate-900">{c.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* key eka nisa lamaya maru karaddi overview eka aluthen load wenawa */}
      {child && (
        <StudentOverview key={child.id} basePath={`/api/parents/me/children/${child.id}`}
          classesTitle={`${child.name}'s classes`}
          emptyHint={`${child.name} has not been added to any class yet.`} />
      )}
    </AppLayout>
  );
}
