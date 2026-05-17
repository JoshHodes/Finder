import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ItemList from "../components/ItemList";
import PhotoCapture from "../components/PhotoCapture";

function LocationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [rescanning, setRescanning] = useState(false);
  const [showRescan, setShowRescan] = useState(false);
  const [rescanPhoto, setRescanPhoto] = useState(null);
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

  async function handleRescan() {
    if (!rescanPhoto) return;

    setRescanning(true);
    setError(null);

    try {
      const res = await fetch(`/api/rescan/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoBase64: rescanPhoto.base64,
          mimeType: rescanPhoto.mimeType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rescan failed");

      // Update the local state with new data
      setLocation((prev) => ({
        ...prev,
        items: data.items,
        photoUrl: data.photoUrl,
      }));
      setShowRescan(false);
      setRescanPhoto(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setRescanning(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !location) {
    return (
      <div className="page">
        <div className="empty-state">
          <h3>Location not found</h3>
          <p>{error}</p>
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
    { day: "numeric", month: "short", year: "numeric" }
  );

  return (
    <div className="page">
      <a className="back-link" href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
        &larr; Back
      </a>

      <div className="detail-header">
        <div>
          <h1 className="page-title">{location.name}</h1>
          <div className="detail-meta">
            Added {formattedDate} &middot; {location.items?.length || 0} items
          </div>
          {location.description && (
            <div className="detail-meta">{location.description}</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowRescan(!showRescan)}
            id="rescan-toggle-btn"
          >
            {showRescan ? "Cancel" : "Re-scan"}
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={deleting}
            id="delete-location-btn"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {showRescan && (
        <div className="rescan-section">
          <p className="rescan-hint">Upload a new photo to re-analyze this location.</p>
          <PhotoCapture
            photoPreview={rescanPhoto?.preview}
            onPhotoSelect={setRescanPhoto}
          />
          {rescanPhoto && (
            <button
              className="btn btn-primary"
              onClick={handleRescan}
              disabled={rescanning}
              style={{ marginTop: 14 }}
              id="rescan-submit-btn"
            >
              {rescanning ? "Analyzing..." : "Re-scan"}
            </button>
          )}
          {error && <div className="status-message error">{error}</div>}
        </div>
      )}

      {rescanning && (
        <div className="analyzing-overlay">
          <div className="spinner"></div>
          <p>Re-analyzing photo...</p>
          <span className="analyzing-sub">Identifying items in view</span>
        </div>
      )}

      <img
        className="detail-photo"
        src={location.photoUrl}
        alt={location.name}
      />

      <div className="detail-section">
        <h2>Detected items</h2>
        {location.items && location.items.length > 0 ? (
          <ItemList items={location.items} />
        ) : (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            No items were detected in this photo.
          </p>
        )}
      </div>
    </div>
  );
}

export default LocationDetail;
