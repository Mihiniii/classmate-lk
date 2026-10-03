import { useEffect, useState } from "react";
import { useParams } from "react-router";
import api, { errorMessage, fieldErrors } from "../api/client";
import { formatLKR, initials } from "../utils/format";
import AppLayout, { EmptyState, StatCard } from "../components/AppLayout";
import { CheckIcon, UsersIcon, WalletIcon } from "../components/Icons";

const METHODS = { CASH: "Cash", BANK_TRANSFER: "Bank transfer", ONLINE: "Online" };
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

// Me masaya yyyy-mm widiyata (local time)
function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function PaymentsPage() {
  const { id } = useParams();
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
    <AppLayout title="Payments" subtitle={summary?.subject}
      backTo={`/classes/${id}`} backLabel="Back to class"
      actions={
        <label className="block">
          <span className="label">Month</span>
          <input type="month" required placeholder="2026-10" value={month} onChange={handleMonthChange}
            className="input w-44" />
        </label>
      }>
      {summary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Paid" value={summary.paidCount} tone="green" icon={<CheckIcon className="h-5 w-5" />} />
          <StatCard label="Unpaid" value={summary.unpaidCount} tone="red" icon={<UsersIcon className="h-5 w-5" />} />
          <StatCard label="Collected" value={formatLKR(summary.collected)} tone="violet"
            icon={<WalletIcon className="h-5 w-5" />} />
          <StatCard label="Expected" value={formatLKR(summary.expected)} tone="slate"
            icon={<WalletIcon className="h-5 w-5" />} />
        </div>
      )}

      {!validMonth && <p className="alert-error">Month must look like 2026-10</p>}
      {error && <p className="alert-error">{error}</p>}
      {validMonth && loading && <p className="text-sm text-slate-500">Loading...</p>}

      {summary && (
        <section className="card overflow-hidden">
          {summary.students.length === 0 ? (
            <EmptyState icon={<UsersIcon className="h-6 w-6" />} title="No students in this class yet"
              hint="Add students from the class page before recording payments." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {summary.students.map((s) => (
                <li key={s.studentId} className="px-6 py-3.5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                        {initials(s.studentName)}
                      </span>
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 font-semibold text-slate-900">
                          {s.studentName}
                          <span className={`badge ${s.paid ? "badge-green" : "badge-red"}`}>
                            {s.paid ? "Paid" : "Unpaid"}
                          </span>
                        </p>
                        {s.paid && (
                          <p className="text-sm text-slate-500">
                            {formatLKR(s.amount)} · {METHODS[s.method] ?? s.method} · {s.paidAt.slice(0, 10)}
                          </p>
                        )}
                      </div>
                    </div>

                    {s.paid ? (
                      <button onClick={() => handleUndo(s)} disabled={undoingId === s.paymentId}
                        className="btn btn-danger btn-sm shrink-0">
                        {undoingId === s.paymentId ? "Undoing..." : "Undo"}
                      </button>
                    ) : (
                      recordingFor !== s.studentId && (
                        <button onClick={() => setRecordingFor(s.studentId)}
                          className="btn btn-primary btn-sm shrink-0">
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
          )}
        </section>
      )}
    </AppLayout>
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
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      {error && <p className="alert-error">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">Amount (LKR)</span>
          <input type="number" required min="0" step="1" autoFocus value={amount}
            onChange={(e) => setAmount(e.target.value)} className="input" />
        </label>
        <label className="block">
          <span className="label">Method</span>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="input">
            {Object.entries(METHODS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="label">Note (optional)</span>
        <input type="text" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)}
          className="input" />
      </label>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={saving} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? "Saving..." : "Save payment"}
        </button>
      </div>
    </form>
  );
}
