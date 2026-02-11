import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try { setBookings(await apiRequest("/bookings")); }
      catch (e) { setError(e.message); }
    })();
  }, []);

  return (
    <section>
      <h2>{user.role === "provider" ? "Assigned Bookings" : "My Bookings"}</h2>
      {error && <p className="error">{error}</p>}
      <ul className="list card">
        {bookings.map((b) => (
          <li key={b.id}>
            <strong>{b.service_title}</strong> | {b.scheduled_date} | {b.status}
            <div>{user.role === "provider" ? `Customer: ${b.user_name}` : `Provider: ${b.provider_name}`}</div>
            <div>{b.address}</div>
          </li>
        ))}
        {!bookings.length && <li>No bookings yet.</li>}
      </ul>
    </section>
  );
}
