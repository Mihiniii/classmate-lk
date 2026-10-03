import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { errorMessage, fieldErrors } from "../api/client";
import AuthLayout from "../components/AuthLayout";
import { BookIcon, UserIcon } from "../components/Icons";

const ROLES = [
  { value: "STUDENT", label: "Student", hint: "Join classes", Icon: UserIcon },
  { value: "TEACHER", label: "Teacher", hint: "Run classes", Icon: BookIcon },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STUDENT" });
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFields({});
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate("/");
    } catch (err) {
      setError(errorMessage(err));
      setFields(fieldErrors(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="It takes less than a minute">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <p className="alert-error">{error}</p>}

        <fieldset>
          <legend className="label">I am a</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-3">
            {ROLES.map(({ value, label, hint, Icon }) => (
              <label key={value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                  form.role === value
                    ? "border-violet-600 bg-violet-50 ring-1 ring-violet-600"
                    : "border-slate-300 bg-white hover:bg-slate-50"
                }`}>
                <input type="radio" name="role" value={value} checked={form.role === value}
                  onChange={handleChange} className="sr-only" />
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  form.role === value ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{label}</span>
                  <span className="block text-xs text-slate-500">{hint}</span>
                </span>
              </label>
            ))}
          </div>
          {fields.role && <span className="field-error">{fields.role}</span>}
        </fieldset>

        <label className="block">
          <span className="label">Name</span>
          <input type="text" name="name" required placeholder="Your full name" value={form.name}
            onChange={handleChange} className="input" />
          {fields.name && <span className="field-error">{fields.name}</span>}
        </label>

        <label className="block">
          <span className="label">Email</span>
          <input type="email" name="email" required placeholder="you@example.com" value={form.email}
            onChange={handleChange} className="input" />
          {fields.email && <span className="field-error">{fields.email}</span>}
        </label>

        <label className="block">
          <span className="label">Password</span>
          <input type="password" name="password" required minLength={6} placeholder="At least 6 characters"
            value={form.password} onChange={handleChange} className="input" />
          {fields.password && <span className="field-error">{fields.password}</span>}
        </label>

        <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-violet-700 hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
}
