import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/format";
import { ArrowLeftIcon, LogoIcon, LogOutIcon } from "./Icons";

// Login unata passe hama page ekakama podu header eka saha page title eka
export default function AppLayout({ title, subtitle, backTo, backLabel, actions, children }) {
  const { user, logout } = useAuth();

  function handleLogout() {
    if (!window.confirm("Are you sure you want to log out?")) return;
    logout();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
              <LogoIcon className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              ClassMate <span className="text-violet-600">LK</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-slate-900">{user.name}</p>
              <p className="text-xs capitalize leading-tight text-slate-500">{user.role.toLowerCase()}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
              {initials(user.name)}
            </span>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Log out">
              <LogOutIcon />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        {backTo && (
          <Link to={backTo}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-violet-700">
            <ArrowLeftIcon />
            {backLabel}
          </Link>
        )}

        {(title || actions) && (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            </div>
            {actions}
          </div>
        )}

        {children}
      </main>
    </div>
  );
}

// Summary gana pennana podi card eka (dashboard, attendance, payments)
export function StatCard({ label, value, icon, tone = "violet" }) {
  const tones = {
    violet: "bg-violet-100 text-violet-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="card flex items-center gap-4 p-4">
      {icon && (
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

// List ekak his welawata pennana kotasa
export function EmptyState({ icon, title, hint }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      {icon && (
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          {icon}
        </span>
      )}
      <p className="font-semibold text-slate-700">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-slate-500">{hint}</p>}
    </div>
  );
}
