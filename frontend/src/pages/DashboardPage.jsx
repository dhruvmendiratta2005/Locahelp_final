import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString();
}

function statusClass(status) {
  return `status-pill status-${(status || "").toLowerCase()}`;
}

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

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const acceptedCount = bookings.filter((b) => b.status === "accepted").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

  const today = new Date(new Date().toDateString());
  const upcomingBookings = [...bookings]
    .filter((b) => b.scheduled_date && new Date(b.scheduled_date) >= today)
    .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
    .slice(0, 5);

  const estimatedEarnings = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (services.find((s) => s.id === b.service_id)?.base_price || 0), 0);

  const activityFeed = [...bookings]
    .sort((a, b) => new Date(b.created_at || b.scheduled_date) - new Date(a.created_at || a.scheduled_date))
    .slice(0, 6)
    .map((b) => {
      const label =
        b.status === "completed"
          ? "Booking completed"
          : b.status === "accepted"
            ? "Booking accepted"
            : b.status === "cancelled"
              ? "Booking cancelled"
              : "New booking request";
      return { id: b.id, label, service: b.service_title, date: b.created_at || b.scheduled_date };
    });

  return (
    <section>
      <h2>Dashboard</h2>
      <p>{user.full_name} ({user.role})</p>
      {error && <p className="error">{error}</p>}

      <div className="dashboard-kpis">
        <article className="card kpi-card">
          <h4>Total Bookings</h4>
          <p>{bookings.length}</p>
        </article>
        <article className="card kpi-card">
          <h4>Pending</h4>
          <p>{pendingCount}</p>
        </article>
        <article className="card kpi-card">
          <h4>Completed</h4>
          <p>{completedCount}</p>
        </article>
        <article className="card kpi-card">
          <h4>Cancelled</h4>
          <p>{cancelledCount}</p>
        </article>
        {user.role === "provider" && (
          <article className="card kpi-card">
            <h4>Estimated Earnings</h4>
            <p>Rs {estimatedEarnings}</p>
          </article>
        )}
        {user.role === "user" && (
          <article className="card kpi-card">
            <h4>Accepted</h4>
            <p>{acceptedCount}</p>
          </article>
        )}
      </div>

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
              {services.map((s)=><li key={s.id}>{s.title} - {s.category} - Rs {s.base_price}</li>)}
              {!services.length && <li>No services yet.</li>}
            </ul>
          </div>
        </div>
      )}

      <div className="dashboard-split">
        <div className="card">
          <h3>Upcoming Bookings</h3>
          <ul className="list">
            {upcomingBookings.map((b) => (
              <li key={b.id}>
                <strong>{b.service_title}</strong> | {formatDate(b.scheduled_date)} | <span className={statusClass(b.status)}>{b.status}</span>
                <div>{user.role === "provider" ? `Customer: ${b.user_name}` : `Provider: ${b.provider_name}`}</div>
                <div>{b.address}</div>
              </li>
            ))}
            {!upcomingBookings.length && <li>No upcoming bookings.</li>}
          </ul>
        </div>

        <div className="card">
          <h3>Activity Feed</h3>
          <ul className="list">
            {activityFeed.map((a) => (
              <li key={a.id}>
                <strong>{a.label}</strong>
                <div>{a.service}</div>
                <div>{formatDate(a.date)}</div>
              </li>
            ))}
            {!activityFeed.length && <li>No activity yet.</li>}
          </ul>
        </div>
      </div>

      <div className="card">
        <h3>{user.role === "provider" ? "All Incoming Bookings" : "All Your Bookings"}</h3>
        <ul className="list">
          {bookings.map((b)=>(
            <li key={b.id}>
              <strong>{b.service_title}</strong> | {formatDate(b.scheduled_date)} | <span className={statusClass(b.status)}>{b.status}</span>
              <div>{user.role === "provider" ? `Customer: ${b.user_name}` : `Provider: ${b.provider_name}`}</div>
              <div>{b.address}</div>
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
