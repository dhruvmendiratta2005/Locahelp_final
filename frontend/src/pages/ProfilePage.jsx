import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    home_address: "",
    office_address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest("/profile");
        setForm({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          city: data.city || "",
          home_address: data.home_address || "",
          office_address: data.office_address || "",
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const data = await apiRequest("/profile", { method: "PUT", body: JSON.stringify(form) });
      updateUser({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        city: data.city,
      });
      setSuccess("Profile updated successfully.");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <section><p>Loading profile...</p></section>;

  return (
    <section className="profile-page">
      <h2>My Profile</h2>
      <p>Manage your personal details and saved addresses.</p>
      <form className="card form-card" onSubmit={handleSubmit}>
        <input
          placeholder="Full Name"
          value={form.full_name}
          onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
        <input
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
        />
        <textarea
          placeholder="Home Address"
          value={form.home_address}
          onChange={(e) => setForm((f) => ({ ...f, home_address: e.target.value }))}
        />
        <textarea
          placeholder="Office Address"
          value={form.office_address}
          onChange={(e) => setForm((f) => ({ ...f, office_address: e.target.value }))}
        />
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>

      <div className="card profile-meta">
        <h3>Account Type</h3>
        <p>{user?.role || "user"}</p>
      </div>
    </section>
  );
}
