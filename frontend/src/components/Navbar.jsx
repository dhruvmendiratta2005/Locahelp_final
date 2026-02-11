import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="topbar">
      <Link to="/" className="brand">LOCAHELP</Link>
      <nav className="main-nav">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Home</NavLink>
        <NavLink to="/services" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Services</NavLink>
        {isAuthenticated && <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Dashboard</NavLink>}
        {isAuthenticated && <NavLink to="/bookings" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Bookings</NavLink>}
        {isAuthenticated && <NavLink to="/help" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Help</NavLink>}
        {!isAuthenticated && <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Login</NavLink>}
        {!isAuthenticated && <NavLink to="/register" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Register</NavLink>}
      </nav>
      {isAuthenticated && (
        <div className="user-pill">
          <Link to="/profile" className="user-name user-name-link">{user.full_name}</Link>
          <span className="role">{user.role}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </header>
  );
}
