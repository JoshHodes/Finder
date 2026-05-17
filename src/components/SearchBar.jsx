import { useState, useEffect, useRef } from "react";

function SearchBar({ onSearch, initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearch(query.trim());
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  return (
    <div className="search-container">
      <span className="search-icon">
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        id="search-input"
        type="text"
        className="search-input"
        placeholder="Search for an item..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}

export default SearchBar;
