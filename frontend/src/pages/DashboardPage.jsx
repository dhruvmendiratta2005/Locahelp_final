import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ title: "", category: "", description: "", city: user?.city || "", base_price: "" });
  const [error, setError] = useState("");

  async function loadData() {
    try {
      if (user.role === "provider") {
        const ownServices = await apiRequest(`/services/provider/${user.id}`);
        setServices(ownServices);
      }
      const b = await apiRequest("/bookings");
      setBookings(b);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function createService(e) {
    e.preventDefault();
    try {
      await apiRequest("/services", { method: "POST", body: JSON.stringify({ ...form, base_price: Number(form.base_price) }) });
      setForm({ title: "", category: "", description: "", city: user?.city || "", base_price: "" });
      loadData();
    } catch (e) {
      setError(e.message);
    }
  }

  async function updateStatus(id, status) {
    try {
      await apiRequest(`/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      loadData();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section>
      <h2>Dashboard</h2>
      <p>{user.full_name} ({user.role})</p>
      {error && <p className="error">{error}</p>}

      {user.role === "provider" && (
        <div className="card split">
          <form onSubmit={createService} className="form-grid">
            <h3>Add Service</h3>
            <input placeholder="Title" value={form.title} onChange={(e)=>setForm((f)=>({...f,title:e.target.value}))} required />
            <input placeholder="Category" value={form.category} onChange={(e)=>setForm((f)=>({...f,category:e.target.value}))} required />
            <input placeholder="City" value={form.city} onChange={(e)=>setForm((f)=>({...f,city:e.target.value}))} required />
            <input type="number" min="1" placeholder="Base Price" value={form.base_price} onChange={(e)=>setForm((f)=>({...f,base_price:e.target.value}))} required />
            <textarea placeholder="Description" value={form.description} onChange={(e)=>setForm((f)=>({...f,description:e.target.value}))} required />
            <button className="btn btn-primary" type="submit">Create</button>
          </form>
          <div>
            <h3>Your Services</h3>
            <ul className="list">
              {services.map((s)=><li key={s.id}>{s.title} - {s.category} - ${s.base_price}</li>)}
              {!services.length && <li>No services yet.</li>}
            </ul>
          </div>
        </div>
      )}

      <div className="card">
        <h3>{user.role === "provider" ? "Incoming Bookings" : "Your Bookings"}</h3>
        <ul className="list">
          {bookings.map((b)=>(
            <li key={b.id}>
              <strong>{b.service_title}</strong> | {b.scheduled_date} | {b.status}
              {user.role === "provider" && (
                <div className="actions-inline">
                  <button onClick={()=>updateStatus(b.id, "accepted")}>Accept</button>
                  <button onClick={()=>updateStatus(b.id, "completed")}>Complete</button>
                  <button onClick={()=>updateStatus(b.id, "cancelled")}>Cancel</button>
                </div>
              )}
            </li>
          ))}
          {!bookings.length && <li>No bookings found.</li>}
        </ul>
      </div>
    </section>
  );
}
