import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ItemList from "../components/ItemList";

function LocationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLocation();
  }, [id]);

  async function fetchLocation() {
    try {
      const res = await fetch(`/api/location/${id}`);
      if (!res.ok) throw new Error("Location not found");
      const data = await res.json();
      setLocation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this location and all its items?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/location/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      navigate("/");
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading location...</p>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">😕</div>
          <h3>Location not found</h3>
          <p>{error || "This location doesn't exist."}</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 20 }}
            onClick={() => navigate("/")}
          >
            Go home
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(location.created_at).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <div className="page">
      <a className="back-link" href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
        ← Back to home
      </a>

      <div className="detail-header">
        <div>
          <h1 className="page-title">{location.name}</h1>
          <div className="detail-meta">
            Added {formattedDate} · {location.items?.length || 0} items detected
          </div>
          {location.description && (
            <div className="detail-meta">{location.description}</div>
          )}
        </div>
        <button
          className="btn btn-danger btn-sm"
          onClick={handleDelete}
          disabled={deleting}
          id="delete-location-btn"
        >
          {deleting ? "Deleting..." : "🗑 Delete"}
        </button>
      </div>

      <img
        className="detail-photo"
        src={location.photoUrl}
        alt={location.name}
      />

      <div className="detail-section">
        <h2>Detected Items</h2>
        {location.items && location.items.length > 0 ? (
          <ItemList items={location.items} />
        ) : (
          <p style={{ color: "var(--text-secondary)" }}>
            No items were detected in this photo.
          </p>
        )}
      </div>
    </div>
  );
}

export default LocationDetail;
