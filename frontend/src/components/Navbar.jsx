import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate("/"); }

  return (
    <header className="topbar">
      <div className="brand">LOCAHELP</div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/services">Services</Link>
        {isAuthenticated && <Link to="/dashboard">Dashboard</Link>}
        {isAuthenticated && <Link to="/bookings">Bookings</Link>}
        {isAuthenticated && <Link to="/help">Help</Link>}
        {!isAuthenticated && <Link to="/login">Login</Link>}
        {!isAuthenticated && <Link to="/register">Register</Link>}
      </nav>
      {isAuthenticated && (
        <div className="user-pill">
          <span>{user.full_name}</span>
          <span className="role">{user.role}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </header>
  );
}
