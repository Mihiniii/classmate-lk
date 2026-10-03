import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage } from "../api/client";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const url = user.role === "TEACHER" ? "/api/classes/my" : "/api/students/me/classes";
    api.get(url)
      .then((res) => setClasses(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, [user.role]);

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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {user.role === "TEACHER" ? "My classes" : "Classes I'm in"}
        </h2>

        {error && <p className="text-red-600">{error}</p>}
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
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}