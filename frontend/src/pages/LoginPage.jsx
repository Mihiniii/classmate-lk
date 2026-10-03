import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/client";
import AuthLayout from "../components/AuthLayout";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your account to continue">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <p className="alert-error">{error}</p>}

        <label className="block">
          <span className="label">Email</span>
          <input type="email" required autoFocus placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)} className="input" />
        </label>

        <label className="block">
          <span className="label">Password</span>
          <input type="password" required placeholder="••••••••" value={password}
            onChange={(e) => setPassword(e.target.value)} className="input" />
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
