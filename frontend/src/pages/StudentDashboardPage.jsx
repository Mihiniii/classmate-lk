import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage } from "../api/client";

const METHODS = { CASH: "Cash", BANK_TRANSFER: "Bank transfer", ONLINE: "Online" };
const STATUS_COLORS = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-amber-100 text-amber-700",
};

// Me masaya yyyy-mm widiyata (local time)
function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Attendance % eka: LATE unath class ekata awa nisa present widiyata gannawa. Records nathnam null
function attendancePercent(records) {
  if (records.length === 0) return null;
  const attended = records.filter((r) => r.status !== "ABSENT").length;
  return Math.round((attended / records.length) * 100);
}

export default function StudentDashboardPage() {
  const { user, logout } = useAuth();
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);   // history eka filter karana class eka
  const historyRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get("/api/students/me/classes"),
      api.get("/api/students/me/attendance"),
      api.get("/api/students/me/payments"),
    ])
      .then(([classesRes, attendanceRes, paymentsRes]) => {
        setClasses(classesRes.data);
        setAttendance(attendanceRes.data);
        setPayments(paymentsRes.data);
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  function handleSelect(classId) {
    setSelectedId(classId);
    historyRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const month = thisMonth();
  const paidThisMonth = new Set(payments.filter((p) => p.month === month).map((p) => p.classId));
  const unpaidCount = classes.filter((c) => !paidThisMonth.has(c.id)).length;
  const overallPercent = attendancePercent(attendance);

  const selected = classes.find((c) => c.id === selectedId);
  const shownAttendance = selected ? attendance.filter((a) => a.classId === selected.id) : attendance;
  const shownPayments = selected ? payments.filter((p) => p.classId === selected.id) : payments;

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
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              <SummaryCard label="Classes joined" value={classes.length} color="text-purple-700" />
              <SummaryCard label="Overall attendance"
                value={overallPercent === null ? "—" : `${overallPercent}% present`}
                color="text-green-700" />
              <SummaryCard label={`Unpaid classes · ${month}`} value={unpaidCount}
                color={unpaidCount > 0 ? "text-red-600" : "text-green-700"} />
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Classes I'm in</h2>
              {classes.length === 0 && <p className="text-gray-500">No classes yet.</p>}

              <div className="grid gap-4 sm:grid-cols-2">
                {classes.map((c) => {
                  const percent = attendancePercent(attendance.filter((a) => a.classId === c.id));
                  const paid = paidThisMonth.has(c.id);
                  return (
                    <button key={c.id} type="button" onClick={() => handleSelect(c.id)}
                      className={`text-left bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow ${
                        selectedId === c.id ? "ring-2 ring-purple-500" : ""
                      }`}>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-gray-900">{c.subject}</h3>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {paid ? "Paid" : "Unpaid"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{c.grade} · {c.teacherName}</p>
                      <p className="mt-2 text-sm text-gray-700">
                        {c.dayOfWeek} · {c.startTime.slice(0, 5)}–{c.endTime.slice(0, 5)}
                      </p>
                      <p className="text-sm text-purple-700 font-medium">LKR {c.monthlyFee.toLocaleString()}</p>
                      <p className="mt-2 text-sm text-gray-700">
                        Attendance: {percent === null ? "not marked yet" : `${percent}% present`}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <div ref={historyRef} className="space-y-6 scroll-mt-4">
              {selected && (
                <p className="text-sm text-gray-700">
                  Showing history for <span className="font-semibold">{selected.subject}</span> ·{" "}
                  <button onClick={() => setSelectedId(null)}
                    className="font-medium text-purple-700 hover:underline">
                    Show all classes
                  </button>
                </p>
              )}

              <section className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="font-semibold text-gray-800 mb-3">Attendance history</h2>
                {shownAttendance.length === 0 ? (
                  <p className="text-gray-500">No attendance records yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-gray-500">
                        <tr>
                          <th className="py-2 pr-4 font-medium">Date</th>
                          <th className="py-2 pr-4 font-medium">Class</th>
                          <th className="py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {shownAttendance.map((a) => (
                          <tr key={`${a.classId}-${a.date}`}>
                            <td className="py-2 pr-4 whitespace-nowrap text-gray-900">{a.date}</td>
                            <td className="py-2 pr-4 text-gray-700">{a.subject}</td>
                            <td className="py-2">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[a.status] ?? ""}`}>
                                {a.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="font-semibold text-gray-800 mb-3">Payment history</h2>
                {shownPayments.length === 0 ? (
                  <p className="text-gray-500">No payments yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-gray-500">
                        <tr>
                          <th className="py-2 pr-4 font-medium">Month</th>
                          <th className="py-2 pr-4 font-medium">Class</th>
                          <th className="py-2 pr-4 font-medium">Amount</th>
                          <th className="py-2 pr-4 font-medium">Method</th>
                          <th className="py-2 font-medium">Paid on</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {shownPayments.map((p) => (
                          <tr key={p.paymentId}>
                            <td className="py-2 pr-4 whitespace-nowrap text-gray-900">{p.month}</td>
                            <td className="py-2 pr-4 text-gray-700">{p.subject}</td>
                            <td className="py-2 pr-4 whitespace-nowrap text-gray-700">
                              LKR {p.amount.toLocaleString()}
                            </td>
                            <td className="py-2 pr-4 whitespace-nowrap text-gray-700">
                              {METHODS[p.method] ?? p.method}
                            </td>
                            <td className="py-2 whitespace-nowrap text-gray-700">{p.paidAt.slice(0, 10)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
