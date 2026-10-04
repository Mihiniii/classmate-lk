import { useEffect, useRef, useState } from "react";
import api, { downloadFile, errorMessage } from "../api/client";
import { formatDay, formatFileSize, formatLKR, formatTimeRange } from "../utils/format";
import { EmptyState, StatCard } from "./AppLayout";
import {
  BookIcon, CalendarIcon, ClipboardCheckIcon, ClockIcon, DownloadIcon, FileIcon, UserIcon, WalletIcon,
} from "./Icons";

const METHODS = { CASH: "Cash", BANK_TRANSFER: "Bank transfer", ONLINE: "Online" };
const STATUS_BADGES = { PRESENT: "badge-green", ABSENT: "badge-red", LATE: "badge-amber" };
const STATUS_LABELS = { PRESENT: "Present", ABSENT: "Absent", LATE: "Late" };

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

// Ek student kenekge classes, attendance saha payments pennana kotasa.
// Student dashboard eke (basePath = /api/students/me) saha parent dashboard eke
// (basePath = /api/parents/me/children/{id}) dekema use karanawa.
// showNotes: class notes (PDF) pennanne student ta witharai, parent ta nemei.
export default function StudentOverview({ basePath, classesTitle, emptyHint, showNotes = false }) {
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);   // history eka filter karana class eka
  const historyRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get(`${basePath}/classes`),
      api.get(`${basePath}/attendance`),
      api.get(`${basePath}/payments`),
      showNotes ? api.get(`${basePath}/notes`) : { data: [] },
    ])
      .then(([classesRes, attendanceRes, paymentsRes, notesRes]) => {
        setClasses(classesRes.data);
        setAttendance(attendanceRes.data);
        setPayments(paymentsRes.data);
        setNotes(notesRes.data);
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [basePath, showNotes]);

  function handleSelect(classId) {
    setSelectedId(classId);
    historyRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleDownload(n) {
    setDownloadError("");
    setDownloadingId(n.noteId);
    try {
      await downloadFile(`/api/classes/${n.classId}/notes/${n.noteId}/file`, n.fileName);
    } catch {
      setDownloadError(`Could not download "${n.title}". Please try again.`);
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading...</p>;
  if (error) return <p className="alert-error">{error}</p>;

  const month = thisMonth();
  const paidThisMonth = new Set(payments.filter((p) => p.month === month).map((p) => p.classId));
  const unpaidCount = classes.filter((c) => !paidThisMonth.has(c.id)).length;
  const overallPercent = attendancePercent(attendance);

  const selected = classes.find((c) => c.id === selectedId);
  const shownAttendance = selected ? attendance.filter((a) => a.classId === selected.id) : attendance;
  const shownPayments = selected ? payments.filter((p) => p.classId === selected.id) : payments;
  const shownNotes = selected ? notes.filter((n) => n.classId === selected.id) : notes;

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Classes joined" value={classes.length} tone="violet"
          icon={<BookIcon className="h-5 w-5" />} />
        <StatCard label="Overall attendance"
          value={overallPercent === null ? "—" : `${overallPercent}% present`} tone="green"
          icon={<ClipboardCheckIcon className="h-5 w-5" />} />
        <StatCard label={`Unpaid classes · ${month}`} value={unpaidCount}
          tone={unpaidCount > 0 ? "red" : "green"} icon={<WalletIcon className="h-5 w-5" />} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold tracking-tight text-slate-900">{classesTitle}</h2>

        {classes.length === 0 ? (
          <div className="card">
            <EmptyState icon={<BookIcon className="h-6 w-6" />} title="No classes yet" hint={emptyHint} />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((c) => {
              const percent = attendancePercent(attendance.filter((a) => a.classId === c.id));
              const paid = paidThisMonth.has(c.id);
              return (
                <button key={c.id} type="button" onClick={() => handleSelect(c.id)}
                  className={`card cursor-pointer p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                    selectedId === c.id ? "border-violet-500 ring-2 ring-violet-500/30" : "hover:border-violet-300"
                  }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-slate-900">{c.subject}</h3>
                      <span className="badge badge-violet mt-1.5">{c.grade}</span>
                    </div>
                    <span className={`badge shrink-0 ${paid ? "badge-green" : "badge-red"}`}>
                      {paid ? "Paid" : "Unpaid"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-slate-400" />
                      {c.teacherName}
                    </div>
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
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                      <span>Attendance</span>
                      <span className="text-slate-900">
                        {percent === null ? "Not marked yet" : `${percent}% present`}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent ?? 0}%` }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div ref={historyRef} className="scroll-mt-20 space-y-6">
        {selected && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
            <span>
              Showing history for <span className="font-semibold">{selected.subject}</span>
            </span>
            <button onClick={() => setSelectedId(null)} className="btn btn-secondary btn-sm">
              Show all classes
            </button>
          </div>
        )}

        {showNotes && (
          <section className="card overflow-hidden">
            <h2 className="flex items-center gap-2 border-b border-slate-200 px-6 py-4 font-bold text-slate-900">
              <FileIcon className="h-5 w-5 text-slate-400" />
              Class notes
            </h2>
            {downloadError && <p className="alert-error mx-6 mt-4">{downloadError}</p>}
            {shownNotes.length === 0 ? (
              <EmptyState title="No notes yet" hint="PDF notes your teachers upload will appear here." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {shownNotes.map((n) => (
                  <li key={n.noteId} className="flex items-center justify-between gap-4 px-6 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                        <FileIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{n.title}</p>
                        <p className="truncate text-sm text-slate-500">
                          {n.subject} · {formatFileSize(n.fileSize)} · uploaded {n.uploadedAt.slice(0, 10)}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => handleDownload(n)} disabled={downloadingId === n.noteId}
                      className="btn btn-secondary btn-sm shrink-0">
                      <DownloadIcon />
                      {downloadingId === n.noteId ? "Downloading..." : "Download"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="card overflow-hidden">
          <h2 className="flex items-center gap-2 border-b border-slate-200 px-6 py-4 font-bold text-slate-900">
            <ClipboardCheckIcon className="h-5 w-5 text-slate-400" />
            Attendance history
          </h2>
          {shownAttendance.length === 0 ? (
            <EmptyState title="No attendance records yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Class</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shownAttendance.map((a) => (
                    <tr key={`${a.classId}-${a.date}`}>
                      <td className="whitespace-nowrap font-medium text-slate-900">{a.date}</td>
                      <td>{a.subject}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGES[a.status] ?? "badge-violet"}`}>
                          {STATUS_LABELS[a.status] ?? a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card overflow-hidden">
          <h2 className="flex items-center gap-2 border-b border-slate-200 px-6 py-4 font-bold text-slate-900">
            <WalletIcon className="h-5 w-5 text-slate-400" />
            Payment history
          </h2>
          {shownPayments.length === 0 ? (
            <EmptyState title="No payments yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Class</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Paid on</th>
                  </tr>
                </thead>
                <tbody>
                  {shownPayments.map((p) => (
                    <tr key={p.paymentId}>
                      <td className="whitespace-nowrap font-medium text-slate-900">{p.month}</td>
                      <td>{p.subject}</td>
                      <td className="whitespace-nowrap">{formatLKR(p.amount)}</td>
                      <td className="whitespace-nowrap">{METHODS[p.method] ?? p.method}</td>
                      <td className="whitespace-nowrap">{p.paidAt.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
