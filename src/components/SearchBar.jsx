import { useState, useEffect, useRef } from "react";

function SearchBar({ onSearch, initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchDebounce = useRef(null);
  const suggestDebounce = useRef(null);
  const containerRef = useRef(null);

  // Trigger the main search with debounce
  useEffect(() => {
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      onSearch(query.trim());
    }, 300);
    return () => clearTimeout(searchDebounce.current);
  }, [query]);

  // Fetch typeahead suggestions with a shorter debounce
  useEffect(() => {
    clearTimeout(suggestDebounce.current);
    if (query.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    suggestDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(query.trim())}&limit=5`);
        const data = await res.json();
        const list = data.suggestions || [];
        setSuggestions(list);
        setShowSuggestions(list.length > 0);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      }
    }, 150);
    return () => clearTimeout(suggestDebounce.current);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleOutsideClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function selectSuggestion(suggestion) {
    setQuery(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
    clearTimeout(searchDebounce.current);
    onSearch(suggestion);
  }

  function handleKeyDown(e) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="search-container" ref={containerRef}>
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
        onChange={(e) => {
          setQuery(e.target.value);
          if (!e.target.value.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
        aria-controls="search-suggestions"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          className="search-suggestions"
          role="listbox"
        >
          {suggestions.map((s, i) => (
            <li
              key={s}
              role="option"
              aria-selected={i === activeIndex}
              className={`suggestion-item ${i === activeIndex ? "active" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault(); // keep input focused
                selectSuggestion(s);
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span className="suggestion-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
