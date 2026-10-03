import { useState } from "react";
import api, { errorMessage, fieldErrors } from "../api/client";
import { formatDay } from "../utils/format";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

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
    <div className="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-slate-900/50 px-4 py-10 backdrop-blur-sm sm:items-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            {existing ? "Edit class" : "New class"}
          </h2>
          <p className="text-sm text-slate-500">
            {existing ? "Update the schedule or fee for this class." : "Set up the schedule and monthly fee."}
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          {error && <p className="alert-error">{error}</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">Subject</span>
              <input type="text" name="subject" required autoFocus placeholder="Combined Maths"
                value={form.subject} onChange={handleChange} className="input" />
              {fields.subject && <span className="field-error">{fields.subject}</span>}
            </label>

            <label className="block">
              <span className="label">Grade</span>
              <input type="text" name="grade" required placeholder="Grade 12"
                value={form.grade} onChange={handleChange} className="input" />
              {fields.grade && <span className="field-error">{fields.grade}</span>}
            </label>
          </div>

          <label className="block">
            <span className="label">Day</span>
            <select name="dayOfWeek" value={form.dayOfWeek} onChange={handleChange} className="input">
              {DAYS.map((d) => (
                <option key={d} value={d}>{formatDay(d)}</option>
              ))}
            </select>
            {fields.dayOfWeek && <span className="field-error">{fields.dayOfWeek}</span>}
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="label">Start time</span>
              <input type="time" name="startTime" required value={form.startTime}
                onChange={handleChange} className="input" />
              {fields.startTime && <span className="field-error">{fields.startTime}</span>}
            </label>
            <label className="block">
              <span className="label">End time</span>
              <input type="time" name="endTime" required value={form.endTime}
                onChange={handleChange} className="input" />
              {fields.endTime && <span className="field-error">{fields.endTime}</span>}
            </label>
          </div>

          <label className="block">
            <span className="label">Monthly fee (LKR)</span>
            <input type="number" name="monthlyFee" required min="0" step="1" placeholder="2500"
              value={form.monthlyFee} onChange={handleChange} className="input" />
            {fields.monthlyFee && <span className="field-error">{fields.monthlyFee}</span>}
          </label>
        </div>

        <div className="flex justify-end gap-3 rounded-b-2xl border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button type="button" onClick={onCancel} disabled={saving} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "Saving..." : existing ? "Save changes" : "Create class"}
          </button>
        </div>
      </form>
    </div>
  );
}
