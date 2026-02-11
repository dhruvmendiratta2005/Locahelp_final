import { useEffect, useState } from "react";
import { apiRequest } from "../api";

export default function HelpPage() {
  const [form, setForm] = useState({ booking_id: "", subject: "", description: "" });
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState("");

  async function loadIssues() {
    try { setIssues(await apiRequest("/issues")); }
    catch (e) { setError(e.message); }
  }

  useEffect(() => { loadIssues(); }, []);

  async function submitIssue(e) {
    e.preventDefault();
    try {
      await apiRequest("/issues", { method: "POST", body: JSON.stringify({ booking_id: form.booking_id ? Number(form.booking_id) : null, subject: form.subject, description: form.description }) });
      setForm({ booking_id: "", subject: "", description: "" });
      loadIssues();
    } catch (e) { setError(e.message); }
  }

  return (
    <section className="split">
      <form onSubmit={submitIssue} className="card form-card">
        <h2>Help & Support</h2>
        <input placeholder="Booking ID (optional)" value={form.booking_id} onChange={(e)=>setForm((f)=>({...f,booking_id:e.target.value}))} />
        <input placeholder="Subject" value={form.subject} onChange={(e)=>setForm((f)=>({...f,subject:e.target.value}))} required />
        <textarea placeholder="Describe issue" value={form.description} onChange={(e)=>setForm((f)=>({...f,description:e.target.value}))} required />
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" type="submit">Report Issue</button>
      </form>

      <div className="card">
        <h3>Your Issues</h3>
        <ul className="list">
          {issues.map((i)=><li key={i.id}><strong>{i.subject}</strong> - {i.status}<div>{i.description}</div></li>)}
          {!issues.length && <li>No issues reported.</li>}
        </ul>
      </div>
    </section>
  );
}
