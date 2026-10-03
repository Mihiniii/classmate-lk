import { useState } from "react";
import api, { errorMessage, fieldErrors } from "../api/client";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500";

// existing dunnoth edit (PUT), nathnam aluth class ekak (POST)
export default function ClassForm({ existing, onSaved, onCancel }) {
  const [form, setForm] = useState({
    subject: existing?.subject ?? "",
    grade: existing?.grade ?? "",
    dayOfWeek: existing?.dayOfWeek ?? "MONDAY",
    startTime: existing?.startTime.slice(0, 5) ?? "",
    endTime: existing?.endTime.slice(0, 5) ?? "",
    monthlyFee: existing?.monthlyFee ?? "",
  });
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFields({});
    if (form.endTime <= form.startTime) {
      setError("End time must be after start time.");
      return;
    }
    setSaving(true);
    const body = { ...form, monthlyFee: Number(form.monthlyFee) };
    try {
      const { data } = existing
        ? await api.put(`/api/classes/${existing.id}`, body)
        : await api.post("/api/classes", body);
      onSaved(data);
    } catch (err) {
      setError(errorMessage(err));
      setFields(fieldErrors(err));
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{existing ? "Edit class" : "New class"}</h2>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Subject</span>
          <input type="text" name="subject" required autoFocus placeholder="Combined Maths"
            value={form.subject} onChange={handleChange} className={inputClass} />
          {fields.subject && <span className="text-xs text-red-600">{fields.subject}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Grade</span>
          <input type="text" name="grade" required placeholder="Grade 12"
            value={form.grade} onChange={handleChange} className={inputClass} />
          {fields.grade && <span className="text-xs text-red-600">{fields.grade}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Day</span>
          <select name="dayOfWeek" value={form.dayOfWeek} onChange={handleChange} className={inputClass}>
            {DAYS.map((d) => (
              <option key={d} value={d}>{d[0] + d.slice(1).toLowerCase()}</option>
            ))}
          </select>
          {fields.dayOfWeek && <span className="text-xs text-red-600">{fields.dayOfWeek}</span>}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Start time</span>
            <input type="time" name="startTime" required value={form.startTime}
              onChange={handleChange} className={inputClass} />
            {fields.startTime && <span className="text-xs text-red-600">{fields.startTime}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">End time</span>
            <input type="time" name="endTime" required value={form.endTime}
              onChange={handleChange} className={inputClass} />
            {fields.endTime && <span className="text-xs text-red-600">{fields.endTime}</span>}
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Monthly fee (LKR)</span>
          <input type="number" name="monthlyFee" required min="0" step="1" placeholder="2500"
            value={form.monthlyFee} onChange={handleChange} className={inputClass} />
          {fields.monthlyFee && <span className="text-xs text-red-600">{fields.monthlyFee}</span>}
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60">
            {saving ? "Saving..." : existing ? "Save changes" : "Create class"}
          </button>
        </div>
      </form>
    </div>
  );
}
