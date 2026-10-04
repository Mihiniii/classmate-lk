import { CheckIcon, LogoIcon } from "./Icons";

const FEATURES = [
  "Manage classes and students in one place",
  "Mark attendance in a few clicks",
  "Track monthly fee payments",
];

// Login saha Register pages dekatama podu layout eka
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
            <LogoIcon className="h-6 w-6" />
          </span>
          <span className="text-xl font-bold tracking-tight">ClassMate LK</span>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Tuition classes,<br />made simple.
          </h2>
          <ul className="mt-8 space-y-4">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-violet-50">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-violet-200">For teachers, students and parents in Sri Lanka</p>
      </aside>

      <main className="flex items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
              <LogoIcon className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              ClassMate <span className="text-violet-600">LK</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

          <div className="card mt-6 p-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
