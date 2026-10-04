import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { errorMessage, fieldErrors } from "../api/client";
import { hasErrors, onlyErrors, validateEmail } from "../utils/validation";
import AuthLayout from "../components/AuthLayout";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();   // register page eken awoth { registered, email } enawa
  const [email, setEmail] = useState(state?.email ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const errors = onlyErrors({
      email: validateEmail(email),
      password: password ? "" : "Password is required",
    });
    setFields(errors);
    if (hasErrors(errors)) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(errorMessage(err));
      setFields(fieldErrors(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your account to continue">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {state?.registered && !error && (
          <p className="alert-success">Account created. Please log in to continue.</p>
        )}
        {error && <p className="alert-error">{error}</p>}

        <label className="block">
          <span className="label">Email</span>
          <input type="email" autoFocus autoComplete="email" placeholder="you@example.com" value={email}
            onChange={(e) => { setEmail(e.target.value); setFields({ ...fields, email: "" }); }}
            aria-invalid={!!fields.email} className="input" />
          {fields.email && <span className="field-error">{fields.email}</span>}
        </label>

        <label className="block">
          <span className="label">Password</span>
          <input type="password" autoComplete="current-password" placeholder="••••••••" value={password}
            onChange={(e) => { setPassword(e.target.value); setFields({ ...fields, password: "" }); }}
            aria-invalid={!!fields.password} className="input" />
          {fields.password && <span className="field-error">{fields.password}</span>}
        </label>

        <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5">
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        New here?{" "}
        <Link to="/register" className="font-semibold text-violet-700 hover:underline">Register</Link>
      </p>
    </AuthLayout>
  );
}
