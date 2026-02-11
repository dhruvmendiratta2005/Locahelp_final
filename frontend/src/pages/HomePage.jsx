import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Find Trusted Local Services in Minutes</h1>
        <p>LOCAHELP connects users with electricians, plumbers, cooks, cleaners, and more.</p>
        <div className="hero-actions">
          <Link to="/services" className="btn btn-primary">Explore Services</Link>
          <Link to="/register" className="btn btn-secondary">Join LOCAHELP</Link>
        </div>
      </div>
      <div className="hero-card">
        <h3>Built for trust</h3>
        <ul>
          <li>Dual login for users and providers</li>
          <li>Booking status workflow</li>
          <li>Star rating reviews</li>
          <li>Support issue reporting</li>
        </ul>
      </div>
    </section>
  );
}
