import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "", city: "", role: "user" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiRequest("/auth/register", { method: "POST", body: JSON.stringify(form) });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="form-wrap">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} className="card form-card">
        <input placeholder="Full name" value={form.full_name} onChange={(e)=>setForm((f)=>({...f,full_name:e.target.value}))} required />
        <input type="email" placeholder="Email" value={form.email} onChange={(e)=>setForm((f)=>({...f,email:e.target.value}))} required />
        <input type="password" placeholder="Password" value={form.password} onChange={(e)=>setForm((f)=>({...f,password:e.target.value}))} required />
        <input placeholder="Phone" value={form.phone} onChange={(e)=>setForm((f)=>({...f,phone:e.target.value}))} />
        <input placeholder="City" value={form.city} onChange={(e)=>setForm((f)=>({...f,city:e.target.value}))} />
        <select value={form.role} onChange={(e)=>setForm((f)=>({...f,role:e.target.value}))}>
          <option value="user">User</option>
          <option value="provider">Service Provider</option>
        </select>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Creating..." : "Register"}</button>
      </form>
    </section>
  );
}
