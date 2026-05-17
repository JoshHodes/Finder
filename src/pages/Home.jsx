import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import LocationCard from "../components/LocationCard";
import ItemList from "../components/ItemList";

function Home() {
  const [locations, setLocations] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    try {
      const res = await fetch("/api/locations");
      if (!res.ok) {
        console.error("API error:", res.status);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setLocations(data);
      }
    } catch (err) {
      console.error("Failed to fetch locations:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query) {
    if (!query) {
      setSearchResults(null);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Your locations</h1>
      <p className="page-subtitle">
        Search across all your saved locations to find what you need.
      </p>

      <SearchBar onSearch={handleSearch} />

      {searchResults && (
        <div className="search-results">
          <div className="search-results-header">
            {searching ? (
              "Searching..."
            ) : searchResults.resultCount > 0 ? (
              <>
                {searchResults.resultCount} result{searchResults.resultCount !== 1 ? "s" : ""} for &quot;{searchResults.query}&quot;
              </>
            ) : (
              <>No results for &quot;{searchResults.query}&quot;</>
            )}
          </div>

          {searchResults.locations?.map((loc) => (
            <Link
              to={`/location/${loc.id}`}
              className="search-result-card"
              key={loc.id}
              id={`search-result-${loc.id}`}
            >
              <img
                className="search-result-image"
                src={loc.photoUrl}
                alt={loc.name}
              />
              <div className="search-result-info">
                <div className="search-result-name">{loc.name}</div>
                <ItemList items={loc.matchedItems} matchedItems={loc.matchedItems} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {!searchResults && (
        <>
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          ) : locations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <h3>No locations yet</h3>
              <p>
                Take a photo of a drawer, shelf, or box and let AI identify
                everything inside.
              </p>
              <Link to="/add" className="btn btn-primary" style={{ marginTop: 20 }}>
                Add your first location
              </Link>
            </div>
          ) : (
            <div className="location-grid">
              {locations.map((loc) => (
                <LocationCard key={loc.id} location={loc} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Home;
