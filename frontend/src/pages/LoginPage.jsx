import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/auth/login", { method: "POST", body: JSON.stringify(form) });
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="form-wrap">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="card form-card">
        <input type="email" placeholder="Email" value={form.email} onChange={(e)=>setForm((f)=>({...f,email:e.target.value}))} required />
        <input type="password" placeholder="Password" value={form.password} onChange={(e)=>setForm((f)=>({...f,password:e.target.value}))} required />
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
      </form>
    </section>
  );
}
