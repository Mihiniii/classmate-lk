import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { errorMessage, fieldErrors } from "../api/client";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500";

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
    <div className="min-h-screen flex items-center justify-center bg-purple-50 px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow p-8 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">ClassMate LK</h1>
          <p className="text-sm text-gray-500">Create a new account</p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Name</span>
          <input type="text" name="name" required value={form.name} onChange={handleChange} className={inputClass} />
          {fields.name && <span className="text-xs text-red-600">{fields.name}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Email</span>
          <input type="email" name="email" required value={form.email} onChange={handleChange} className={inputClass} />
          {fields.email && <span className="text-xs text-red-600">{fields.email}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Password</span>
          <input type="password" name="password" required minLength={6} value={form.password}
            onChange={handleChange} className={inputClass} />
          <span className="text-xs text-gray-500">At least 6 characters</span>
          {fields.password && <span className="block text-xs text-red-600">{fields.password}</span>}
        </label>

        <fieldset>
          <legend className="text-sm font-medium text-gray-700">I am a</legend>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {[["STUDENT", "Student"], ["TEACHER", "Teacher"]].map(([value, label]) => (
              <label key={value}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium ${
                  form.role === value
                    ? "border-purple-600 bg-purple-50 text-purple-700"
                    : "border-gray-300 text-gray-600"
                }`}>
                <input type="radio" name="role" value={value} checked={form.role === value}
                  onChange={handleChange} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
          {fields.role && <span className="text-xs text-red-600">{fields.role}</span>}
        </fieldset>

        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-purple-600 py-2 font-semibold text-white hover:bg-purple-700 disabled:opacity-60">
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-purple-700 hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}
