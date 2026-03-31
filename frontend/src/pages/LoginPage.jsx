import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const data = await apiRequest("/auth/login", { 
        method: "POST", 
        body: JSON.stringify(form) 
      });
      if (data.requires_otp) {
        setShowOtp(true);
        setSuccessMsg(data.message || "OTP sent to your email!");
      } else {
        login(data);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const data = await apiRequest("/auth/verify-otp", { 
        method: "POST", 
        body: JSON.stringify({ email: form.email, otp }) 
      });
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
      {!showOtp ? (
        <form onSubmit={handleLoginSubmit} className="card form-card">
          <input type="email" placeholder="Email" value={form.email} onChange={(e)=>setForm((f)=>({...f,email:e.target.value}))} required />
          <input type="password" placeholder="Password" value={form.password} onChange={(e)=>setForm((f)=>({...f,password:e.target.value}))} required />
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="card form-card">
          {successMsg && <p className="success" style={{color: 'green', marginBottom: '10px'}}>{successMsg}</p>}
          <p style={{marginBottom: '15px'}}>Please enter the 6-digit OTP sent to {form.email}</p>
          <input type="text" placeholder="Enter OTP" value={otp} onChange={(e)=>setOtp(e.target.value)} required maxLength={6} style={{marginBottom: '10px'}} />
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify OTP"}</button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowOtp(false)} disabled={loading} style={{marginTop: '10px', backgroundColor: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)'}}>Back to Login</button>
        </form>
      )}
    </section>
  );
}
