import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { errorMessage, fieldErrors } from "../api/client";
import {
  PASSWORD_RULES, hasErrors, onlyErrors, validateEmail, validateName, validatePassword,
} from "../utils/validation";
import AuthLayout from "../components/AuthLayout";
import { BookIcon, CheckIcon, UserIcon, UsersIcon } from "../components/Icons";

const ROLES = [
  { value: "STUDENT", label: "Student", hint: "Join classes", Icon: UserIcon },
  { value: "TEACHER", label: "Teacher", hint: "Run classes", Icon: BookIcon },
  { value: "PARENT", label: "Parent", hint: "Follow a child", Icon: UsersIcon },
];

function validate(form) {
  return onlyErrors({
    name: validateName(form.name),
    email: validateEmail(form.email),
    password: validatePassword(form.password),
    confirmPassword: !form.confirmPassword
      ? "Please confirm your password"
      : form.confirmPassword !== form.password ? "Passwords do not match" : "",
    role: ROLES.some((r) => r.value === form.role) ? "" : "Choose Student, Teacher or Parent",
  });
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "STUDENT" });
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFields({ ...fields, [e.target.name]: "" });   // type karaddi e field eke error eka ain karanawa
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const errors = validate(form);
    setFields(errors);
    if (hasErrors(errors)) return;

    setLoading(true);
    try {
      const email = form.email.trim();
      await register(form.name.trim(), email, form.password, form.role);
      navigate("/login", { replace: true, state: { registered: true, email } });
    } catch (err) {
      setError(errorMessage(err));
      setFields(fieldErrors(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="It takes less than a minute">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {error && <p className="alert-error">{error}</p>}

        <fieldset>
          <legend className="label">I am a</legend>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {ROLES.map(({ value, label, hint, Icon }) => (
              <label key={value}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border px-2 py-3 text-center transition ${
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
          <input type="text" name="name" autoComplete="name" maxLength={100} placeholder="Your full name"
            value={form.name} onChange={handleChange} aria-invalid={!!fields.name} className="input" />
          {fields.name && <span className="field-error">{fields.name}</span>}
        </label>

        <label className="block">
          <span className="label">Email</span>
          <input type="email" name="email" autoComplete="email" maxLength={255} placeholder="you@example.com"
            value={form.email} onChange={handleChange} aria-invalid={!!fields.email} className="input" />
          {fields.email && <span className="field-error">{fields.email}</span>}
        </label>

        <label className="block">
          <span className="label">Password</span>
          <input type="password" name="password" autoComplete="new-password" maxLength={72}
            placeholder="Create a strong password" value={form.password} onChange={handleChange}
            aria-invalid={!!fields.password} className="input" />
          {fields.password && <span className="field-error">{fields.password}</span>}
          <ul className="mt-2 space-y-1">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(form.password);
              return (
                <li key={rule.label}
                  className={`flex items-center gap-2 text-xs ${ok ? "text-emerald-700" : "text-slate-500"}`}>
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    ok ? "bg-emerald-100" : "bg-slate-100"
                  }`}>
                    {ok && <CheckIcon className="h-3 w-3" />}
                  </span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </label>

        <label className="block">
          <span className="label">Confirm password</span>
          <input type="password" name="confirmPassword" autoComplete="new-password" maxLength={72}
            placeholder="Type your password again" value={form.confirmPassword} onChange={handleChange}
            aria-invalid={!!fields.confirmPassword} className="input" />
          {fields.confirmPassword && <span className="field-error">{fields.confirmPassword}</span>}
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
