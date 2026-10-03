import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage, fieldErrors } from "../api/client";

const METHODS = { CASH: "Cash", BANK_TRANSFER: "Bank transfer", ONLINE: "Online" };
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500";

// Me masaya yyyy-mm widiyata (local time)
function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function PaymentsPage() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [month, setMonth] = useState(thisMonth);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recordingFor, setRecordingFor] = useState(null);   // form eka open wela thiyena studentId
  const [undoingId, setUndoingId] = useState(null);

  const validMonth = MONTH_PATTERN.test(month);

  useEffect(() => {
    if (!MONTH_PATTERN.test(month)) return;
    let ignore = false;   // masaya ikmanin wenas kaloth parana response eka ain karanna
    api.get(`/api/classes/${id}/payments`, { params: { month } })
      .then((res) => {
        if (ignore) return;
        setSummary(res.data);
        setError("");
      })
      .catch((err) => {
        if (!ignore) setError(errorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [id, month]);

  // Record / undo walin passe summary eka backend eken aye gannawa
  async function reload() {
    try {
      const { data } = await api.get(`/api/classes/${id}/payments`, { params: { month } });
      setSummary(data);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function handleMonthChange(e) {
    setMonth(e.target.value);
    setSummary(null);
    setRecordingFor(null);
    setError("");
    setLoading(true);
  }

  async function handleRecorded() {
    setRecordingFor(null);
    setError("");
    await reload();
  }

  async function handleUndo(s) {
    if (!window.confirm(`Undo ${s.studentName}'s payment for ${month}?`)) return;
    setError("");
    setUndoingId(s.paymentId);
    try {
      await api.delete(`/api/classes/${id}/payments/${s.paymentId}`);
      await reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUndoingId(null);
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
        <Link to={`/classes/${id}`} className="inline-block text-sm font-medium text-purple-700 hover:underline">
          ← Back to class
        </Link>

        <section className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Payments{summary && ` · ${summary.subject}`}
          </h2>
          <label className="mt-3 block max-w-xs">
            <span className="text-sm font-medium text-gray-700">Month</span>
            <input type="month" required placeholder="2026-10" value={month} onChange={handleMonthChange}
              className={inputClass} />
          </label>

          {summary && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SummaryTile label="Paid" value={summary.paidCount} color="text-green-700" />
              <SummaryTile label="Unpaid" value={summary.unpaidCount} color="text-red-600" />
              <SummaryTile label="Collected" value={`LKR ${summary.collected.toLocaleString()}`}
                color="text-purple-700" />
              <SummaryTile label="Expected" value={`LKR ${summary.expected.toLocaleString()}`}
                color="text-gray-700" />
            </div>
          )}
        </section>

        {!validMonth && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">Month must look like 2026-10</p>
        )}
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
        {validMonth && loading && <p className="text-gray-500">Loading...</p>}

        {summary && (
          <section className="bg-white rounded-xl shadow-sm p-5">
            {summary.students.length === 0 && <p className="text-gray-500">No students in this class yet.</p>}

            <ul className="divide-y divide-gray-100">
              {summary.students.map((s) => (
                <li key={s.studentId} className="py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-medium text-gray-900">
                        {s.studentName}
                        {s.paid ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                            Paid
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                            Unpaid
                          </span>
                        )}
                      </p>
                      {s.paid && (
                        <p className="text-sm text-gray-500">
                          LKR {s.amount.toLocaleString()} · {METHODS[s.method] ?? s.method} · {s.paidAt.slice(0, 10)}
                        </p>
                      )}
                    </div>

                    {s.paid ? (
                      <button onClick={() => handleUndo(s)} disabled={undoingId === s.paymentId}
                        className="shrink-0 text-sm font-medium text-red-600 hover:underline disabled:opacity-60">
                        {undoingId === s.paymentId ? "Undoing..." : "Undo"}
                      </button>
                    ) : (
                      recordingFor !== s.studentId && (
                        <button onClick={() => setRecordingFor(s.studentId)}
                          className="shrink-0 rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-purple-700">
                          Record payment
                        </button>
                      )
                    )}
                  </div>

                  {!s.paid && recordingFor === s.studentId && (
                    <RecordPaymentForm classId={id} studentId={s.studentId} month={month}
                      defaultAmount={summary.monthlyFee}
                      onRecorded={handleRecorded} onCancel={() => setRecordingFor(null)} />
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function RecordPaymentForm({ classId, studentId, month, defaultAmount, onRecorded, onCancel }) {
  const [amount, setAmount] = useState(defaultAmount);
  const [method, setMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post(`/api/classes/${classId}/payments`, {
        studentId,
        month,
        amount: Number(amount),
        method,
        note: note.trim() || null,
      });
      await onRecorded();
    } catch (err) {
      const fields = Object.values(fieldErrors(err));
      setError(fields.length > 0 ? fields.join(", ") : errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 rounded-lg bg-purple-50 p-4 space-y-3">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Amount (LKR)</span>
          <input type="number" required min="0" step="1" autoFocus value={amount}
            onChange={(e) => setAmount(e.target.value)} className={`${inputClass} bg-white`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Method</span>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className={`${inputClass} bg-white`}>
            {Object.entries(METHODS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Note (optional)</span>
        <input type="text" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)}
          className={`${inputClass} bg-white`} />
      </label>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={saving}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60">
          {saving ? "Saving..." : "Save payment"}
        </button>
      </div>
    </form>
  );
}

function SummaryTile({ label, value, color }) {
  return (
    <div className="rounded-lg bg-purple-50 px-3 py-2">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}
