import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";

export default function ServicesPage() {
  const { user, isAuthenticated } = useAuth();
  const [filters, setFilters] = useState({ category: "", city: "" });
  const [services, setServices] = useState([]);
  const [reviewsByProvider, setReviewsByProvider] = useState({});
  const [booking, setBooking] = useState({ service_id: "", scheduled_date: "", address: "", notes: "" });
  const [review, setReview] = useState({ booking_id: "", rating: 5, comment: "" });
  const [myBookings, setMyBookings] = useState([]);
  const [error, setError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const bookingSuccessTimerRef = useRef(null);

  async function loadServices() {
    try {
      const q = new URLSearchParams();
      if (filters.category) q.set("category", filters.category);
      if (filters.city) q.set("city", filters.city);
      const data = await apiRequest(`/services?${q.toString()}`);
      setServices(data);

      const ids = [...new Set(data.map((s) => s.provider_id))];
      const tmp = {};
      await Promise.all(ids.map(async (id) => { tmp[id] = await apiRequest(`/reviews/provider/${id}`); }));
      setReviewsByProvider(tmp);
    } catch (e) { setError(e.message); }
  }

  async function loadMyBookings() {
    if (!isAuthenticated || user.role !== "user") return;
    try { setMyBookings(await apiRequest("/bookings")); } catch (e) { setError(e.message); }
  }

  useEffect(() => { loadServices(); }, []);
  useEffect(() => { loadMyBookings(); }, [isAuthenticated]);
  useEffect(() => () => {
    if (bookingSuccessTimerRef.current) window.clearTimeout(bookingSuccessTimerRef.current);
  }, []);

  async function handleBook(e) {
    e.preventDefault();
    try {
      await apiRequest("/bookings", { method: "POST", body: JSON.stringify({ service_id: Number(booking.service_id), scheduled_date: booking.scheduled_date, address: booking.address, notes: booking.notes }) });
      setBooking({ service_id: "", scheduled_date: "", address: "", notes: "" });
      setError("");
      setBookingSuccess(true);
      if (bookingSuccessTimerRef.current) window.clearTimeout(bookingSuccessTimerRef.current);
      bookingSuccessTimerRef.current = window.setTimeout(() => setBookingSuccess(false), 2200);
      loadMyBookings();
    } catch (e) { setError(e.message); }
  }

  async function handleReview(e) {
    e.preventDefault();
    try {
      await apiRequest("/reviews", { method: "POST", body: JSON.stringify({ booking_id: Number(review.booking_id), rating: Number(review.rating), comment: review.comment }) });
      setReview({ booking_id: "", rating: 5, comment: "" });
      loadServices();
    } catch (e) { setError(e.message); }
  }

  return (
    <section>
      {bookingSuccess && (
        <div className="booking-success-popup" role="status" aria-live="polite">
          <div className="booking-success-tick">?</div>
          <div>
            <strong>Booking request raised</strong>
          </div>
        </div>
      )}
      <h2>Services</h2>
      <div className="card form-grid">
        <input placeholder="Category" value={filters.category} onChange={(e)=>setFilters((f)=>({...f,category:e.target.value}))} />
        <input placeholder="City" value={filters.city} onChange={(e)=>setFilters((f)=>({...f,city:e.target.value}))} />
        <button className="btn btn-secondary" onClick={loadServices}>Search</button>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="grid cards-3">
        {services.map((s) => {
          const rev = reviewsByProvider[s.provider_id] || { average_rating: 0, count: 0 };
          return (
            <article className="card" key={s.id}>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
              <p><strong>{s.category}</strong> - {s.city}</p>
              <p>Rs {s.base_price}</p>
              <p>Provider: {s.provider_name}</p>
              <p>Rating: {rev.average_rating} / 5 ({rev.count})</p>
            </article>
          );
        })}
      </div>

      {isAuthenticated && user.role === "user" && (
        <div className="split">
          <form onSubmit={handleBook} className="card form-card">
            <h3>Book Service</h3>
            <select value={booking.service_id} onChange={(e)=>setBooking((f)=>({...f,service_id:e.target.value}))} required>
              <option value="">Select service</option>
              {services.map((s)=><option key={s.id} value={s.id}>{s.title} ({s.city})</option>)}
            </select>
            <input type="date" value={booking.scheduled_date} onChange={(e)=>setBooking((f)=>({...f,scheduled_date:e.target.value}))} required />
            <input placeholder="Address" value={booking.address} onChange={(e)=>setBooking((f)=>({...f,address:e.target.value}))} required />
            <textarea placeholder="Notes" value={booking.notes} onChange={(e)=>setBooking((f)=>({...f,notes:e.target.value}))} />
            <button className="btn btn-primary" type="submit">Book</button>
          </form>

          <form onSubmit={handleReview} className="card form-card">
            <h3>Leave Review</h3>
            <select value={review.booking_id} onChange={(e)=>setReview((f)=>({...f,booking_id:e.target.value}))} required>
              <option value="">Completed booking</option>
              {myBookings.filter((b)=>b.status==="completed").map((b)=><option key={b.id} value={b.id}>#{b.id} - {b.service_title}</option>)}
            </select>
            <input type="number" min="1" max="5" value={review.rating} onChange={(e)=>setReview((f)=>({...f,rating:e.target.value}))} required />
            <textarea placeholder="Comment" value={review.comment} onChange={(e)=>setReview((f)=>({...f,comment:e.target.value}))} />
            <button className="btn btn-primary" type="submit">Submit</button>
          </form>
        </div>
      )}
    </section>
  );
}
