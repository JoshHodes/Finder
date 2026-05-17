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

  // Load all locations on mount
  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    try {
      const res = await fetch("/api/locations");
      const data = await res.json();
      setLocations(data);
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
      <h1 className="page-title">Find anything</h1>
      <p className="page-subtitle">
        Search across all your saved locations to find what you need.
      </p>

      <SearchBar onSearch={handleSearch} />

      {/* Search Results */}
      {searchResults && (
        <div className="search-results">
          <div className="search-results-header">
            {searching ? (
              "Searching..."
            ) : searchResults.resultCount > 0 ? (
              <>
                Found {searchResults.resultCount} match
                {searchResults.resultCount !== 1 ? "es" : ""} for &quot;
                {searchResults.query}&quot;
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

      {/* All Locations */}
      {!searchResults && (
        <>
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading locations...</p>
            </div>
          ) : locations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📸</div>
              <h3>No locations yet</h3>
              <p>
                Start by photographing a drawer, shelf, or box and labelling
                where it is.
              </p>
              <Link to="/add" className="btn btn-primary" style={{ marginTop: 20 }}>
                + Add your first location
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
