import { useState, useEffect, useRef } from "react";

function SearchBar({ onSearch, initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const debounceRef = useRef(null);

  useEffect(() => {
    // Debounce search — wait 300ms after user stops typing
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
      <span className="search-icon">🔍</span>
      <input
        id="search-input"
        type="text"
        className="search-input"
        placeholder="Where are my scissors?"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}

export default SearchBar;
