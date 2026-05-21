import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ItemList from "../components/ItemList";
import PhotoCapture from "../components/PhotoCapture";
import ImageWithHighlights from "../components/ImageWithHighlights";

function CategoryIcon({ category }) {
  const shared = {
    width: 13,
    height: 13,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };
  switch (category) {
    case "Tools":
      return <svg {...shared}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
    case "Electronics":
      return <svg {...shared}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>;
    case "Stationery":
      return <svg {...shared}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
    case "Kitchen":
      return <svg {...shared}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><line x1="7" y1="2" x2="7" y2="22"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>;
    case "Cleaning":
      return <svg {...shared}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .963L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>;
    case "Clothing":
      return <svg {...shared}><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>;
    case "Toiletries":
      return <svg {...shared}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>;
    case "Food & Drink":
      return <svg {...shared}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
    case "Cables & Chargers":
      return <svg {...shared}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
    case "Batteries & Power":
      return <svg {...shared}><rect x="2" y="7" width="16" height="10" rx="2" ry="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>;
    case "Toys":
      return <svg {...shared}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    case "Books":
      return <svg {...shared}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
    default:
      return <svg {...shared}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
  }
}

function ItemsByCategory({ items, onItemHover = null }) {
  const hasCategoryData = items.some((item) => item.category);

  if (!hasCategoryData) {
    return <ItemList items={items} onItemHover={onItemHover} />;
  }

  const grouped = {};
  for (const item of items) {
    const cat = item.category || "Miscellaneous";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  const categories = Object.keys(grouped).sort((a, b) => {
    if (a === "Miscellaneous") return 1;
    if (b === "Miscellaneous") return -1;
    return grouped[b].length - grouped[a].length;
  });

  return (
    <div className="categories-list">
      {categories.map((cat) => (
        <div key={cat} className="category-section">
          <div className="category-header">
            <span className="category-icon"><CategoryIcon category={cat} /></span>
            <span className="category-label">{cat}</span>
            <span className="category-count">{grouped[cat].length}</span>
          </div>
          <ItemList items={grouped[cat]} onItemHover={onItemHover} />
        </div>
      ))}
    </div>
  );
}

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
  const [hoveredItem, setHoveredItem] = useState(null);

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

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server error (${res.status})`);
      }
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

      <ImageWithHighlights
        src={location.photoUrl}
        alt={location.name}
        className="detail-photo"
        highlightedItems={hoveredItem ? [hoveredItem] : []}
      />

      <div className="detail-section">
        <h2>Detected items</h2>
        {location.items && location.items.length > 0 ? (
          <ItemsByCategory items={location.items} onItemHover={setHoveredItem} />
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
