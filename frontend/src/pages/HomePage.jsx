import { Link } from "react-router-dom";
import heroImg from "../assets/home-hero.svg";
import plumbingImg from "../assets/home-plumbing.svg";
import electricianImg from "../assets/home-electrician.svg";
import cookImg from "../assets/home-cook.svg";

export default function HomePage() {
  return (
    <section className="home-page">
      <div className="home-hero">
        <div className="home-hero-content card">
          <p className="home-kicker">Local help. Real providers. Fast booking.</p>
          <h1>Book trusted local services without calling ten different people.</h1>
          <p>
            LOCAHELP is a local marketplace where users can discover verified service providers,
            compare options by city and category, and book in minutes.
          </p>
          <div className="hero-actions">
            <Link to="/services" className="btn btn-primary">Explore Services</Link>
            <Link to="/register" className="btn btn-secondary">Join LOCAHELP</Link>
          </div>
          <div className="home-stats">
            <div><strong>6+</strong><span>Service Categories</span></div>
            <div><strong>2 Roles</strong><span>Users and Providers</span></div>
            <div><strong>1 Flow</strong><span>Search, Book, Track</span></div>
          </div>
        </div>
        <div className="home-hero-image card">
          <img src={heroImg} alt="Locahelp platform overview" />
        </div>
      </div>

      <div className="home-about card">
        <h2>About LOCAHELP</h2>
        <p>
          LOCAHELP was built to make everyday local services predictable and transparent.
          Instead of depending on random contacts, users can find providers, check ratings,
          and manage bookings in one place. Providers get a simple dashboard to publish services
          and manage customer requests.
        </p>
      </div>

      <div className="home-sections-grid">
        <article className="card">
          <h3>How It Works</h3>
          <ul className="list">
            <li>Search services by category and city.</li>
            <li>Book the slot with address and notes.</li>
            <li>Track booking status and leave reviews.</li>
          </ul>
        </article>
        <article className="card">
          <h3>Why People Use It</h3>
          <ul className="list">
            <li>Simple user and provider login flows.</li>
            <li>Service-specific booking workflow.</li>
            <li>Ratings and issue reporting for trust.</li>
          </ul>
        </article>
      </div>

      <div className="home-services">
        <h2>Popular Services</h2>
        <div className="grid cards-3">
          <article className="card service-highlight">
            <img src={plumbingImg} alt="Plumbing services" />
            <h3>Plumbing</h3>
            <p>Leak repairs, pipe fixes, tap replacements, and urgent home visits.</p>
          </article>
          <article className="card service-highlight">
            <img src={electricianImg} alt="Electrician services" />
            <h3>Electrician</h3>
            <p>Wiring checks, switchboard repair, and appliance point setup.</p>
          </article>
          <article className="card service-highlight">
            <img src={cookImg} alt="Cook services" />
            <h3>Cook</h3>
            <p>Daily meal prep, family cooking, and event-based home support.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
