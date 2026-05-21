import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhotoCapture from "../components/PhotoCapture";
import ItemList from "../components/ItemList";

function AddLocation() {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!photo || !locationName.trim()) return;

    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoBase64: photo.base64,
          mimeType: photo.mimeType,
          locationName: locationName.trim(),
          description: description.trim() || undefined,
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server error (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="page">
      <a className="back-link" href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
        &larr; Back
      </a>
      <h1 className="page-title">Add a location</h1>
      <p className="page-subtitle">
        Upload a photo of a drawer, shelf, or box. AI will identify every item inside.
      </p>

      {analyzing && (
        <div className="analyzing-overlay">
          <div className="spinner"></div>
          <p>Analyzing photo...</p>
          <span className="analyzing-sub">
            Identifying items in view
          </span>
        </div>
      )}

      {result ? (
        <div className="analysis-result">
          <h3>
            Saved &mdash; {result.items.length} items detected
          </h3>
          <ItemList items={result.items} />
          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/location/${result.location.id}`)}
              id="view-location-btn"
            >
              View location
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setPhoto(null);
                setLocationName("");
                setDescription("");
                setResult(null);
              }}
              id="add-another-btn"
            >
              Add another
            </button>
          </div>
        </div>
      ) : (
        <form className="add-location-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Photo</label>
            <PhotoCapture
              photoPreview={photo?.preview}
              onPhotoSelect={setPhoto}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="location-name-input">
              Location name
            </label>
            <input
              id="location-name-input"
              className="form-input"
              type="text"
              placeholder="e.g. Kitchen drawer left of sink"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description-input">
              Description (optional)
            </label>
            <input
              id="description-input"
              className="form-input"
              type="text"
              placeholder="e.g. Top drawer, utensils section"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && (
            <div className="status-message error">{error}</div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={!photo || !locationName.trim() || analyzing}
            id="analyze-submit-btn"
          >
            {analyzing ? "Analyzing..." : "Analyze & Save"}
          </button>
        </form>
      )}
    </div>
  );
}

export default AddLocation;
